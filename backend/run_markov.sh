#!/bin/bash
SHARED_DIR="$HOME/ollama_txts/"
IP_FILE="$SHARED_DIR/ollama_ip_$$.txt"
READY_FILE="$SHARED_DIR/ollama_ready_$$.txt"
rm -f "$IP_FILE" "$READY_FILE"

cleanup() {
    echo "Cleaning up..."
    kill $SRUN_PID 2>/dev/null
    rm -f "$IP_FILE" "$READY_FILE"
    exit 1
}
trap cleanup SIGINT SIGTERM

echo "Launching ollama on GPU node..."
srun -A csdsx93 -p markov_gpu --gres=gpu:1 bash -c '
    hostname
    NODE_IP=$(hostname -I | awk "{print \$1}")
    echo $NODE_IP > '"$IP_FILE"'
    OLLAMA_HOST=0.0.0.0:11434 ollama serve &
    for i in $(seq 1 30); do
        if curl -s "http://localhost:11434" > /dev/null 2>&1; then
            touch '"$READY_FILE"'
            break
        fi
        sleep 2
    done
    wait
' &

SRUN_PID=$!

echo "Waiting for GPU node IP..."
for i in $(seq 1 60); do
    if [ -f "$READY_FILE" ]; then
        NODE_IP=$(cat "$IP_FILE")
        export OLLAMA_HOST=$NODE_IP
        echo "Ollama is ready at $NODE_IP:11434"
        break
    fi
    sleep 3
done

if [ -z "$NODE_IP" ]; then
    echo "Timed out waiting for GPU node"
    cleanup
fi

echo "Launching client on CPU node..."
srun -A csdsx93 -p markov_cpu bash -c "
    cd $HOME/collabo/backend && hostname && OLLAMA_HOST=${NODE_IP}:11434 uv run manage.py runserver 0.0.0.0:9012 2>&1
"

kill $SRUN_PID 2>/dev/null
rm -f "$IP_FILE" "$READY_FILE"
