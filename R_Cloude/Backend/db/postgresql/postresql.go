package postgresql

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func InitPostgresql()(*pgxpool.Pool,error){
	dbURL:= os.Getenv("DATABASE URL")
	pool,err:= pgxpool.New(context.Background(),dbURL)
	if err != nil{
		return nil,err
	}
	if err:= pool.Ping(context.Background()); err != nil{
		pool.Close()
		return nil,err
	}
	return pool,nil
}