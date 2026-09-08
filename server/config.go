package main

import (
	"os"
	"strconv"
)

// Config dibaca dari env dengan default yang masuk akal untuk dev.
type Config struct {
	Addr              string // ":8080"
	DBPath            string // data.db
	JWTSecret         string
	DigiflazzUsername string
	DigiflazzAPIKey   string
	// AI proxy upstream — tanpa isi, mode mock AI (gema echo).
	AIUpstreamOpenAI    string // base URL OpenAI-compatible
	AIUpstreamAnthropic string // base URL Anthropic-compatible
	AIAPIKey            string
}

func LoadConfig() Config {
	cfg := Config{
		Addr:      getenv("ADDR", ":8080"),
		DBPath:    getenv("DB_PATH", "data.db"),
		JWTSecret: getenv("JWT_SECRET", "dev-secret-change-me"),
		DigiflazzUsername: getenv("DIGIFLAZZ_USERNAME", ""),
		DigiflazzAPIKey:   getenv("DIGIFLAZZ_API_KEY", ""),
		AIUpstreamOpenAI:    getenv("AI_UPSTREAM_OPENAI", "https://api.openai.com/v1"),
		AIUpstreamAnthropic: getenv("AI_UPSTREAM_ANTHROPIC", "https://api.anthropic.com/v1"),
		AIAPIKey:            getenv("AI_UPSTREAM_KEY", ""),
	}
	return cfg
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func getenvInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}
