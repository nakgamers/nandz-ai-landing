package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	cfg := LoadConfig()

	// DB path: default data.db di folder server/
	if cfg.DBPath == "data.db" {
		cfg.DBPath = filepath.Join(".", "data.db")
	}
	store, err := OpenStore(cfg.DBPath)
	if err != nil {
		log.Fatalf("store: %v", err)
	}
	defer store.db.Close()

	prov := pickProvider(&cfg)

	srv := NewServer(store, prov, cfg)
	handler := srv.Routes()

	log.Printf("listening on %s (mock provider: %v, AI key: %s)",
		cfg.Addr, prov.Name() == "mock", maskKey(cfg.AIAPIKey))

	// Graceful shutdown (ponytail: minimal, cukup untuk dev)
	if err := http.ListenAndServe(cfg.Addr, handler); err != nil {
		log.Fatalf("serve: %v", err)
		os.Exit(1)
	}
}

func maskKey(k string) string {
	if len(k) < 8 {
		return "unset"
	}
	return k[:4] + "..." + k[len(k)-4:]
}