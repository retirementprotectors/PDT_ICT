#!/bin/bash

# Application name and port calculation
APP_NAME="pdt-ict"
PORT_SUFFIX="072"  # p=16, d=4, t=20, i=9, c=3, t=20 = 72

# Port prefixes
FRONTEND_PREFIX="51"
BACKEND_PREFIX="52"
DATA_PREFIX="53"

# Calculate ports
FRONTEND_PORT="${FRONTEND_PREFIX}${PORT_SUFFIX}"  # 51072
BACKEND_PORT="${BACKEND_PREFIX}${PORT_SUFFIX}"    # 52072
DB_PORT="${DATA_PREFIX}${PORT_SUFFIX}"           # 53072

# Function to check if a port is in use
is_port_in_use() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to check if all ports are available
check_ports() {
    local ports=($FRONTEND_PORT $BACKEND_PORT $DB_PORT)
    local services=("Frontend" "Backend" "Database")
    local all_available=true

    echo "Checking port availability..."
    for i in "${!ports[@]}"; do
        if is_port_in_use "${ports[$i]}"; then
            echo "❌ ${services[$i]} port ${ports[$i]} is in use"
            all_available=false
        else
            echo "✅ ${services[$i]} port ${ports[$i]} is available"
        fi
    done

    if [ "$all_available" = false ]; then
        return 1
    fi
    return 0
}

# Function to start the application
start_app() {
    if ! check_ports; then
        echo "Error: Some ports are already in use"
        exit 1
    fi

    echo "Starting PDT ICT with dynamic ports:"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
    echo "Backend:  http://localhost:$BACKEND_PORT"
    echo "Database: localhost:$DB_PORT"
    
    # Create .env file with dynamic ports
    cat > .env << EOF
NODE_ENV=development
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
DB_PORT=$DB_PORT
DB_NAME=pdt_ict_${PORT_SUFFIX}
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev_jwt_secret_${PORT_SUFFIX}
SESSION_SECRET=dev_session_secret_${PORT_SUFFIX}
EOF

    # Start the application with docker-compose
    FRONTEND_PORT=$FRONTEND_PORT \
    BACKEND_PORT=$BACKEND_PORT \
    DB_PORT=$DB_PORT \
    docker-compose up --build -d

    echo "Application started successfully!"
    echo "Frontend UI:  http://localhost:$FRONTEND_PORT"
    echo "Backend API: http://localhost:$BACKEND_PORT"
    echo "Database:    localhost:$DB_PORT"
}

# Function to stop the application
stop_app() {
    if [ -f .env ]; then
        source .env
        FRONTEND_PORT=$FRONTEND_PORT \
        BACKEND_PORT=$BACKEND_PORT \
        DB_PORT=$DB_PORT \
        docker-compose down -v
        rm .env
        echo "Application stopped successfully!"
    else
        echo "No .env file found. Is the application running?"
    fi
}

# Function to show status
show_status() {
    if [ -f .env ]; then
        source .env
        echo "PDT ICT Status:"
        echo "Frontend UI:  http://localhost:$FRONTEND_PORT ($(is_port_in_use $FRONTEND_PORT && echo "running" || echo "stopped"))"
        echo "Backend API: http://localhost:$BACKEND_PORT ($(is_port_in_use $BACKEND_PORT && echo "running" || echo "stopped"))"
        echo "Database:    localhost:$DB_PORT ($(is_port_in_use $DB_PORT && echo "running" || echo "stopped"))"
    else
        echo "Application is not running"
    fi
}

# Main script logic
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        stop_app
        sleep 2
        start_app
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit 0 