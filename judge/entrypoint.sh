#!/usr/bin/env bash
# entrypoint.sh

LANG="${1,,}"
TIMEOUT_MS="$2"
cd /sandbox || exit 1

# Wait for code file
for i in {1..5}; do
  sleep 1
  if ls Main_*.* &>/dev/null; then break; fi
done

# Validate timeout
if ! [[ "$TIMEOUT_MS" =~ ^[0-9]+$ ]]; then
  echo '{"verdict":"Error","output":"","error":"Invalid timeout","executionTime":0,"memoryUsed":0}'
  exit 1
fi
TIMEOUT_S=$(bc -l <<<"$TIMEOUT_MS/1000")

# Helper: runs command under GNU time, captures stdout/stderr
run_and_time() {
  timeout "${TIMEOUT_S}s" \
    /usr/bin/time -f "%e %M %x" -o __meta.txt \
    bash -c "$@" > __out.txt 2>&1
}

# Compile / run
case "$LANG" in
  java)
    mv Main_*.java Main.java
    javac Main.java 2> compile.err
    if [ $? -ne 0 ]; then
      err=$(sed 's/"/\\"/g' compile.err)
      echo "{\"verdict\":\"Compilation Error\",\"output\":\"\",\"error\":\"$err\",\"executionTime\":0,\"memoryUsed\":0}"
      exit 0
    fi
    run_and_time "java -cp . Main"
    ;;
  cpp|c)
  echo "DEBUG: Compiling C++ code" >&2
  CPP_FILE=$(ls Main_*.cpp 2>/dev/null)
  mv "$CPP_FILE" Main.cpp
  g++ Main.cpp -o main 2> compile.err
  if [ $? -ne 0 ]; then
    err=$(sed 's/"/\\"/g' compile.err)
    echo "{\"verdict\":\"Compilation Error\",\"output\":\"\",\"error\":\"$err\",\"executionTime\":0,\"memoryUsed\":0}"
    exit 0
  fi

  cp ./main /tmp/main
  chmod +x /tmp/main

  echo "DEBUG: Executing /tmp/main with run_and_time" >&2
  run_and_time "/tmp/main"
  ;;
  python)
    mv Main_*.py Main.py
    run_and_time "python3 Main.py"
    ;;
  *)
    echo '{"verdict":"Error","output":"","error":"Unsupported language","executionTime":0,"memoryUsed":0}'
    exit 0
    ;;
esac

# Read resource usage
read time mem exit_code < __meta.txt

# Read program output
# Escape quotes and backslashes for JSON
out=$(sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' __out.txt)

# Determine final verdict
if   [ "$exit_code" -eq 124 ]; then verdict="Time Limit Exceeded"
elif [ "$exit_code" -ne 0 ];   then verdict="Runtime Error"
else verdict="Accepted"; fi

# Emit one clean JSON
echo -n "{\"verdict\":\"$verdict\","
echo -n "\"output\":\"$out\","
echo -n "\"error\":\"\","
echo -n "\"executionTime\":$time,"
echo    "\"memoryUsed\":$mem}"
exit 0
