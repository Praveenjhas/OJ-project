#!/usr/bin/env bash
# entrypoint.sh

set -euo pipefail

# parameters for execution
LANGUAGE="$1"
TIME_LIMIT_MS="$2"
MEMORY_LIMIT_MB="$3"

# derived
TIME_LIMIT_SEC=$(awk "BEGIN {print $TIME_LIMIT_MS/1000}")

# exit_code used to determine actual problem in handler
exit_code=0
ulimit -s 65532
case $LANGUAGE in
  cpp)
    mv Main_*.cpp Main.cpp
    g++ Main.cpp -o main 2> compile.err
    compile_status=$?
    if [ $compile_status -ne 0 ]; then
      echo -e "Compilation Failed.\n"
      exit 1
    fi
    # Run the program in a child bash that sets ulimit only for that child,
    # then exec the binary so the limit applies only to the process tree below.
    timeout "${TIME_LIMIT_SEC}s" /usr/bin/time -f "%e %M " -o __meta.txt \
      bash -lc "ulimit -v $((MEMORY_LIMIT_MB*1024)) && exec ./main" >__out.txt 2>&1
    exit_code=$?
    ;;
  java)
    mv Main_*.java Main.java
    javac Main.java 2> compile.err
    compile_status=$?
    if [ $compile_status -ne 0 ]; then
      echo -n "Compilation Failed.\n"
      exit 1
    fi
    timeout "${TIME_LIMIT_SEC}s" /usr/bin/time -f "%e %M " -o __meta.txt \
      bash -lc "ulimit -v $((MEMORY_LIMIT_MB*1024)) && exec java -cp . Main" >__out.txt 2>&1
    exit_code=$?
    ;;
  python)
    mv Main_*.py Main.py
    # apply ulimit in the child bash here too (keeps parent safe)
    timeout "${TIME_LIMIT_SEC}s" /usr/bin/time -f "%e %M " -o __meta.txt \
      bash -lc "ulimit -v $((MEMORY_LIMIT_MB*1024)) && exec python3 Main.py" >__out.txt 2>&1
    exit_code=$?
    ;;
esac

# Check for graceful MLE (bad_alloc, MemoryError, etc.)
if grep -qi -E "bad_alloc|MemoryError|OutOfMemoryError|OutOfMemory|java.lang.OutOfMemoryError" __out.txt 2>/dev/null; then
    echo "Memory Limit Exceeded"
    exit 137
fi

# Parse max RSS (KB) from __meta.txt produced by `time -f "%e %M "`
max_rss_kb=0
if [ -f __meta.txt ]; then
  # try verbose field first, then the simple "<elapsed> <maxrss>" fallback
  max_rss_kb=$(awk -F: '/Maximum resident set size/ { gsub(/[^0-9]/,"",$2); print int($2); exit }' __meta.txt || echo "")
  if [ -z "$max_rss_kb" ] || ! echo "$max_rss_kb" | grep -qE '^[0-9]+'; then
    max_rss_kb=$(awk 'NF>=2{print int($2); exit} END{print 0}' __meta.txt 2>/dev/null || echo 0)
  fi
fi

# Determine allowed KB
allowed_kb=$(( MEMORY_LIMIT_MB * 1024 ))

# If measured peak RSS >= allowed, it's an MLE
if [ -n "$max_rss_kb" ] && [ "$max_rss_kb" -ge "$allowed_kb" ]; then
  echo "Memory Limit Exceeded"
  exit 137
fi

# If the process was killed by a signal, detect which signal.
# Convention: shell exit code for signal N is 128 + N
if [ "$exit_code" -ge 128 ]; then
  sig=$(( exit_code - 128 ))
  # treat SIGKILL (9) as likely memory-related MLE (this matches previous behavior)
  if [ "$sig" -eq 9 ]; then
    echo "Memory Limit Exceeded (killed by SIGKILL)"
    # show peak RSS if available for debugging
    if [ -n "$max_rss_kb" ]; then
      echo "Peak RSS (KB): $max_rss_kb  Allowed (KB): $allowed_kb"
    fi
    exit 137
  else
    echo "Process terminated by signal $sig (exit code $exit_code)"
    # still include peak RSS info for debugging
    if [ -n "$max_rss_kb" ]; then
      echo "Peak RSS (KB): $max_rss_kb  Allowed (KB): $allowed_kb"
    fi
    exit $exit_code
  fi
fi

case $exit_code in
  0)
    echo "Program completed successfully"
    exit $exit_code
    ;;
  124)
    echo "Time Limit Exceeded"
    exit $exit_code
    ;;
  125)
    echo "timeout command failed"
    exit $exit_code
    ;;
  126)
    echo "Command not executable"
    exit $exit_code
    ;;
  127)
    echo "Command not found"
    exit $exit_code
    ;;
  137)
    # fallback: if we still see 137 here, treat as MLE (old behavior)
    echo "Memory Limit Exceeded"
    exit $exit_code
    ;;
  *)
    echo "Runtime error (exit code $exit_code)"
    exit $exit_code
    ;;
esac
