YARN ?= yarn

.PHONY: all restart lint
all: lint restart

restart:  # Ensures that we are only restarting locally
	sh bin/dev/restart.sh

lint:
	lint-staged
