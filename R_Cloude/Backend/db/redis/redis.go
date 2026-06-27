package redis

import (
	"context"
	"os"
	"fmt"
	goredis "github.com/go-redis/redis/v9"
)
var (
	Ctx = context.Background()
	Client *goredis.Client
)
func InitRedis() error{
otp,err := goredis.ParseURL(os.Getenv("REDIS_URL"))
if err != nil{
	return err
}
Client = goredis.NewClient(otp)
if  err:= Client.Ping(Ctx).Err(); err != nil{
	return err

}
fmt.Println("Redis connected successfully")
return nil
}



