// ==UserScript==
// @name         GitHub CONTRIBUTING includer
// @namespace    https://github.com/ghes
// @version      0.1.2
// @description  Include CONTRIBUTING.md in places you'd contribute
// @author       Stuart P. Bentley (@stuartpb)
// @match        https://github.com/*/*/issues/new
// @match        https://github.com/*/*/compare/*
// @match        https://github.com/*/*/new/*
// @match        https://github.com/*/*/edit/*
// @match        https://github.com/*/*/delete/*
// @grant        none
// ==/UserScript==

// Copyright 2015 Stuart P. Bentley.
// This work may be used freely as long as this notice is included.
// The work is provided "as is" without warranty, express or implied.

function createClearfix () {
  var cf = document.createElement('div');
  cf.className = 'meta clearfix';
  return cf;
}

function getContributingLink(doc){
  var message = doc.getElementsByClassName('contributing')[0];
  return message && message.getElementsByTagName('a')[0];
}

function importContributing(resDoc,href) {
  var readme = resDoc.getElementById('readme');

  if (readme) {
    readme.id = 'contributing';

    readme.className =
       'readme boxed-group clearfix announce instapaper_body md';
    document.adoptNode(readme);
    var h3 = document.createElement('h3');
    var namespan = document.createElement('a');
    namespan.href = href;
    namespan.textContent = ' '+href.slice(href.lastIndexOf('/')+1);
    var icon = document.createElement('span');
    icon.className = 'octicon octicon-megaphone';
    namespan.insertBefore(icon, namespan.firstChild);

    h3.appendChild(namespan);
    readme.insertBefore(h3, readme.firstChild);

    // This is generally the best container to add to for all the pages
    // we transclude the README into.
    var container = document.getElementById('js-repo-pjax-container')
      .querySelector('.repository-content');

    // Some forms' last element give enough space, some don't
    // I don't if there'd be a better class to put on the element
    // or something like that, so we'll just hack it
    readme.style.marginTop = '15px';

    container.appendChild(createClearfix());
    container.appendChild(readme);
  }
}

function getDocument(href,cb) {
  var request = new XMLHttpRequest();
  request.addEventListener('load', function(){
    cb(request.response);
  });
  request.open('GET',href,true);
  request.responseType = 'document';
  request.send();
}

var link = getContributingLink(document);
if (link) {
  getDocument(link.href, function(resDoc){
    importContributing(resDoc, link.href);

    // Change the warning to point to the new location
    link.href = '#contributing';

    // since it's taking them somewhere on this page, remove target=_blank
    link.removeAttribute('target');
  });
} else {
  // Editor pages don't have a contributing message that would point us to the
  // CONTRIBUTING file, by default, so we cheat by stealing it from the New
  // Issue page. If the repo doesn't accept issues, this'll just have to fail.
  // (Enforce route because /compare/ can be missing the "contributing"
  // message, in cases where we don't want it.)
  var base = /^(https:\/\/github\.com\/[^/]+\/[^/]+)\/(new|edit|delete)/
    .exec(location.href);
  if (base){
    base = base[1];

    getDocument( base + '/issues/new', function(linkResDoc) {

      // We could get the whole Contributing message here, adopt the div,
      // and add it above the form here, but we don't, for these reasons:
      // 1. That would push existing elements down, and interfering with click
      //    targets after page load without user interaction is *the worst*.
      // 2. Users don't necessarily *want* their change to go through the pull
      //    request system, so there's no need to boink them about it yet.

      link = getContributingLink(linkResDoc);
        if (link) {
          getDocument(link.href, function(readmeResDoc){
            importContributing(readmeResDoc, link.href);

            // no need to update the link since we're not importing it
          });
        }
    });
  }
}
