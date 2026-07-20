package config

import (
	"os"
	"time"
	"strconv"

	"github.com/joho/godotenv"
)
type Config struct{
	Port   string
	ServerWriteTimeout time.Duration
	ServerReadTimeout time.Duration
	ShutdownTimeout time.Duration

}
func LoadConfig()(*Config,error){
	_=godotenv.Load()
	port:=os.Getenv("PLANNER_SERVICE_PORT")
	if port==""{
		port="8085"
	}
	serverWriteTimeout:=parseDurationEnv("SERVER_WRITE_TIMEOUT_SECONDS",15)
	serverReadTimeout:=parseDurationEnv("SERVER_READ_TIMEOUT_SECONDS",15)
	shutdownTimeout:=parseDurationEnv("SHUTDOWN_TIMEOUT_SECONDS",10)
	return &Config{
		Port:port,
		ServerWriteTimeout: serverWriteTimeout,
		ServerReadTimeout: serverReadTimeout,
		ShutdownTimeout: shutdownTimeout,
	},nil
}
func parseDurationEnv(key string, defaultSeconds int) time.Duration {
	raw :=os.Getenv(key)
	if raw==""{
		return time.Duration(defaultSeconds)*time.Second
	}
	seconds,err:=strconv.Atoi(raw)
	if err!=nil{
		return time.Duration(defaultSeconds)*time.Second
	}
	return time.Duration(seconds)*time.Second
}

