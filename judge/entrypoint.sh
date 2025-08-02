#!/usr/bin/env bash
LANG="${1,,}"
TIMEOUT_MS="$2"
cd /sandbox || exit 1

# Wait up to 5 seconds for the code file to appear
for i in {1..5}; do
  sleep 1
  echo "DEBUG: Attempt $i - Contents of /sandbox:" >&2
  ls -l >&2
  if [ -n "$(ls Main_*.* 2>/dev/null)" ]; then
    break
  fi
  if [ "$i" -eq 5 ]; then
    echo "ERROR: No code file found after 5 attempts." >&2
    exit 1
  fi
done

# Validate time limit
if ! [[ "$TIMEOUT_MS" =~ ^[0-9]+$ ]]; then
  echo "ERROR: Invalid time limit: '$TIMEOUT_MS'" >&2
  exit 1
fi
TIMEOUT_S=$(echo "scale=3; $TIMEOUT_MS / 1000" | bc)

case "$LANG" in
  java)
    # Java branch
    JAVA_FILE=$(ls Main_*.java 2>/dev/null)
    mv "$JAVA_FILE" Main.java
    javac Main.java 2>&1 | tee /dev/stderr
    if [ $? -ne 0 ]; then
      echo "ERROR: Java compilation failed" >&2
      exit 1
    fi
    timeout --preserve-status --signal=KILL "${TIMEOUT_S}s" java Main 2>&1 | tee /dev/stderr
    ;;

  cpp|c)
    # C/C++ branch
    echo "DEBUG: Compiling C++ code" >&2
    CPP_FILE=$(ls Main_*.cpp 2>/dev/null)
    mv "$CPP_FILE" Main.cpp
    g++ Main.cpp -o main 2>&1 | tee /dev/stderr
    if [ $? -ne 0 ]; then
      echo "ERROR: C++ compilation failed" >&2
      exit 1
    fi

    # Copy binary into container’s own writable exec-enabled fs
    cp ./main /tmp/main
    chmod +x /tmp/main

    echo "DEBUG: Executing /tmp/main" >&2
    timeout --preserve-status --signal=KILL "${TIMEOUT_S}s" /tmp/main 2>&1 | tee /dev/stderr
    ;;

  python)
    # Python branch
    PY_FILE=$(ls Main_*.py 2>/dev/null)
    mv "$PY_FILE" Main.py
    timeout --preserve-status --signal=KILL "${TIMEOUT_S}s" python3 Main.py 2>&1 | tee /dev/stderr
    ;;

  *)
    echo "Unsupported language: $LANG" >&2
    exit 1
    ;;
esac

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "DEBUG: Command exited with code $EXIT_CODE" >&2
fi
exit $EXIT_CODE
