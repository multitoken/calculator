
DEVELOP_BRANCH = develop

site: bump_version ghpages merge_develop siteclean gensite copysite commit_build

bump_version:
	npm run bump:patch

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

commit_build:
	git add . && git commit -m 'build'

.PHONY: site bump_version ghpages merge_develop siteclean gensite copysite commit_build
