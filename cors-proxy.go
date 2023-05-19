package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

type CORSProxy struct{}

func (c CORSProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.Body.Close()

	if r.Method != "GET" {
		http.Error(w, "Only 'GET' requests are permitted.", http.StatusMethodNotAllowed)
		return
	}

	res, err := http.Get(strings.TrimPrefix(r.RequestURI, "/"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for header, values := range res.Header {
		for _, val := range values {
			w.Header().Add(header, val)
		}
	}

	w.Header().Add("Access-Control-Allow-Origin", "*") // Whole point of this proxy!
	w.WriteHeader(res.StatusCode)

	if _, err := io.Copy(w, res.Body); err != nil {
		log.Printf("Error copying response body: %v", err)
	}

	res.Body.Close()
}

func main() {
	var port int

	flag.IntVar(&port, "port", 8080, "The port to listen on")
	flag.Parse()

	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), CORSProxy{}); err != nil {
		log.Fatalf("Error while serving: %v", err)
	}
}
