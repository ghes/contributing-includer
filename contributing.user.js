// ==UserScript==
// @name         GitHub CONTRIBUTING includer
// @namespace    https://github.com/ghes
// @version      0.1.0
// @description  Include CONTRIBUTING.md in places you'd contribute
// @author       Stuart P. Bentley (@stuartpb)
// @match        https://github.com/*/*/issues/new
// @match        https://github.com/*/*/compare/*
// @match        https://github.com/*/*/new/*
// @match        https://github.com/*/*/edit/*
// @grant        none
// ==/UserScript==

// Copyright 2015 Stuart P. Bentley.
// This work may be used freely as long as this notice is included.
// The work is provided "as is" without warranty, express or implied.

var contributing = document.getElementsByClassName('contributing')[0];

function createClearfix () {
  var cf = document.createElement('div');
  cf.className = 'meta clearfix';
  return cf;
}

function importContributing(resDoc,href,cb) {
  var readme = resDoc.getElementById('readme');

  if (readme) {
    // `#readme` has specific CSS so we can't change it
    // readme.id = 'contributing';

    readme.className =
       'boxed-group flush clearfix announce instapaper_body md';
    document.adoptNode(readme);
    var h3 = document.createElement('h3');
    var namespan = document.createElement('a');
    namespan.href = href;
    namespan.textContent = href.slice(href.lastIndexOf('/')+1);

    // TODO: Rewrite all relative links to be
    // relative to the original location

    h3.appendChild(namespan);
    readme.insertBefore(h3, readme.firstChild);
    // TODO: determine correct way to add contributing to page
    var container = document.getElementById('js-repo-pjax-container');

    // Some forms' last element give enough space, some don't
    // I don't if there'd be a better class to put on the element
    // or something like that, so we'll just hack it
    readme.style.marginTop = '15px';

    container.appendChild(createClearfix());
    container.appendChild(readme);
    cb();
  }
}

function getAndImportContributing(href,cb) {
  var request = new XMLHttpRequest();
  request.addEventListener('load', function(){
    importContributing(request.response,
      href, cb);
  });
  request.open('GET',href,true);
  request.responseType = 'document';
  request.send();
}

if (contributing) {
  var link = contributing.getElementsByTagName('a')[0];
  getAndImportContributing(link.href, function(){
    link.href = '#readme';
    // '#contributing'; // if we could change the ID, which we can't

    // since it's taking them somewhere on this page, remove target=_blank
    link.removeAttribute('target');
  });
} else {
  // TODO: implement /new/ and /edit/
}
