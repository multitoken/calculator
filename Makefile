
DEVELOP_BRANCH = develop

site: ghpages merge_develop siteclean gensite copysite

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

.PHONY: site ghpages merge_develop siteclean gensite copysite
