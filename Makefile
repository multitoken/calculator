
DEVELOP_BRANCH = develop

site: bump_version ghpages merge_develop siteclean gensite copysite

bump_version:
	npm run bump:minor

ghpages:
	git checkout gh-pages

merge_develop:
	git merge $(DEVELOP_BRANCH)

siteclean:
	rm -rf ./static/*

gensite:
	npm run build

copysite:
	cp -R ./build/* ./

.PHONY: site bump_version ghpages merge_develop siteclean gensite copysite
