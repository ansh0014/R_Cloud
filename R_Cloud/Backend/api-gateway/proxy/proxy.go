package proxy

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

type ServiceProxy struct{}

func NewServiceProxy() *ServiceProxy {
	return &ServiceProxy{}
}

func (sp *ServiceProxy) Forward(w http.ResponseWriter, r *http.Request, targetBaseURL string, pathPrefixStrip string) error {
	targetURL, err := url.Parse(targetBaseURL)
	if err != nil {
		return fmt.Errorf("invalid target URL %s: %w", targetBaseURL, err)
	}

	proxy := &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = targetURL.Scheme
			req.URL.Host = targetURL.Host
			req.Host = targetURL.Host

			if pathPrefixStrip != "" {
				req.URL.Path = strings.TrimPrefix(req.URL.Path, pathPrefixStrip)
			}
			if !strings.HasPrefix(req.URL.Path, "/") {
				req.URL.Path = "/" + req.URL.Path
			}
		},
		ErrorHandler: func(w http.ResponseWriter, req *http.Request, err error) {
			http.Error(w, fmt.Sprintf("Service unreachable: %v", err), http.StatusBadGateway)
		},
	}

	proxy.ServeHTTP(w, r)
	return nil
}

func (sp *ServiceProxy) ProxyToRuntime(w http.ResponseWriter, r *http.Request, runtimeURL string, endpoint string) error {
	targetURL, err := url.Parse(runtimeURL)
	if err != nil {
		return fmt.Errorf("invalid runtime URL %s: %w", runtimeURL, err)
	}

	targetEndpoint := targetURL.String() + endpoint

	req, err := http.NewRequestWithContext(r.Context(), r.Method, targetEndpoint, r.Body)
	if err != nil {
		return fmt.Errorf("failed to create runtime proxy request: %w", err)
	}

	req.Header = r.Header.Clone()

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("runtime execution unreachable: %w", err)
	}
	defer resp.Body.Close()

	for k, vv := range resp.Header {
		for _, v := range vv {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, err = io.Copy(w, resp.Body)
	return err
}
