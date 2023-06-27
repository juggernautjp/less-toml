SHELL=/usr/bin/bash
HUGO_BIN=hugo
GO_BIN=go
NPM_BIN=npm

.PHONY: build test demo clean

build: clean
	$(NPM_BIN) run build

test:
	$(NPM_BIN) run test

demo:
	$(NPM_BIN) run demo

clean:
	rm -rf less-toml-*.vsix
