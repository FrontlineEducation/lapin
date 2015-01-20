test:
	@node node_modules/lab/bin/lab -r
test-cov:
	@node node_modules/lab/bin/lab -c -v -r console
test-cov-html:
	@node node_modules/lab/bin/lab -r html -o coverage.html

.PHONY: test test-cov test-cov-html
