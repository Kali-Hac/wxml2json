
/**
 * 
 * wxmlParser改造自: https://github.com/blowsie/Pure-JavaScript-HTML5-Parser
 * 
 * author: Kali-Hac(好葱)
 * organization: SCUT
 * 
 * github地址: https://github.com/Kali-Hac
 * 
 * for: 微信小程序wxml解析
 * detail : wxmlParser库是基于htmlParser库写的，保留原作者的注释
 */
/*
 * HTML5 Parser By Sam Blowes
 *
 * Designed for HTML5 documents
 *
 * Original code by John Resig (ejohn.org)
 * http://ejohn.org/blog/pure-javascript-html-parser/
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * ----------------------------------------------------------------------------
 * License
 * ----------------------------------------------------------------------------
 *
 * This code is triple licensed using Apache Software License 2.0,
 * Mozilla Public License or GNU Public License
 * 
 * ////////////////////////////////////////////////////////////////////////////
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * ////////////////////////////////////////////////////////////////////////////
 * 
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is Simple HTML Parser.
 * 
 * The Initial Developer of the Original Code is Erik Arvidsson.
 * Portions created by Erik Arvidssson are Copyright (C) 2004. All Rights
 * Reserved.
 * 
 * ////////////////////////////////////////////////////////////////////////////
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * ----------------------------------------------------------------------------
 * Usage
 * ----------------------------------------------------------------------------
 *
 * // Use like so:
 * HTMLParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */

(function () {
	
	//Crucial Change
	// Regular Expressions for parsing tags and attributes
	//这里的startTag和attr不需要改，在2sjon文件里改就可以了
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
		attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	//Crucial Change
	// Empty Elements - HTML 5
	var empty = makeMap("input,image,map");
	// empty = makeMap("view,scrollview,swiper,icon,text,progress,button,action-sheet,form,modal,input,progress,checkbox,toast,radio,picker,slider,navigator,switch,label,audio,map,image,video,canvas");
	// Block Elements - HTML 5
	var block = makeMap("block,view,scrollview,swiper,icon,text,progress,button,action-sheet,form,modal,input,progress,checkbox,toast,radio,picker,slider,navigator,switch,label,audio,map,image,video,canvas");

	// Inline Elements - HTML 5
	var inline = makeMap("icon,progress,button,input,image,map");
	// inline = makeMap("view,scrollview,swiper,icon,text,progress,button,action-sheet,form,modal,input,progress,checkbox,toast,radio,picker,slider,navigator,switch,label,audio,map,image,video,canvas");
	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	//微信小程序里没有可以不闭合的标签
	var closeSelf = makeMap("");

	// Attributes that have their values filled in disabled="disabled"
	//填充的属性可以后面再解析出来
	var fillAttrs = makeMap("");

	// Special Elements (can contain anything)
	var special = makeMap("wxxxcode-style,script,style");

	var HTMLParser = this.HTMLParser = function (html, handler) {
		var index, chars, match, stack = [], last = html;
		stack.last = function () {
			return this[this.length - 1];
		};

		while (html) {
			chars = true;

			// Make sure we're not in a script or style element
			if (!stack.last() || !special[stack.last()]) {

				// Comment
				if (html.indexOf("<!--") == 0) {
					index = html.indexOf("-->");
					if (index >= 0) {
						if (handler.comment)
							handler.comment(html.substring(4, index));
						html = html.substring(index + 3);
						chars = false;
					}

					// end tag
				} else if (html.indexOf("</") == 0) {
					match = html.match(endTag);

					if (match) {
						html = html.substring(match[0].length);
						match[0].replace(endTag, parseEndTag);
						chars = false;
					}

					// start tag
				} else if (html.indexOf("<") == 0) {
					match = html.match(startTag);

					if (match) {
						html = html.substring(match[0].length);
						match[0].replace(startTag, parseStartTag);
						chars = false;
					}
				}

				if (chars) {
					index = html.indexOf("<");

					var text = index < 0 ? html : html.substring(0, index);
					html = index < 0 ? "" : html.substring(index);

					if (handler.chars)
						handler.chars(text);
				}

			} else {
				html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function (all, text) {
					text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
					if (handler.chars)
						handler.chars(text);

					return "";
				});

				parseEndTag("", stack.last());
			}

			if (html == last){
				// console.log(html)
				throw "Parse Error: " + html;
			}
			last = html;
		}

		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag(tag, tagName, rest, unary) {
			tagName = tagName.toLowerCase();

			if (block[tagName]) {
				while (stack.last() && inline[stack.last()]) {
					parseEndTag("", stack.last());
				}
			}

			if (closeSelf[tagName] && stack.last() == tagName) {
				parseEndTag("", tagName);
			}

			unary = empty[tagName] || !!unary;

			if (!unary)
				stack.push(tagName);

			if (handler.start) {
				var attrs = [];

				rest.replace(attr, function (match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";

					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});

				if (handler.start)
					handler.start(tagName, attrs, unary);
			}
		}

		function parseEndTag(tag, tagName) {
			// If no tag name is provided, clean shop
			if (!tagName)
				var pos = 0;

				// Find the closest opened tag of the same type
			else
				for (var pos = stack.length - 1; pos >= 0; pos--)
					if (stack[pos] == tagName)
						break;

			if (pos >= 0) {
				// Close all the open elements, up the stack
				for (var i = stack.length - 1; i >= pos; i--)
					if (handler.end)
						handler.end(stack[i]);

				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
	};

	this.HTMLtoXML = function (html) {
		var results = "";

		HTMLParser(html, {
			start: function (tag, attrs, unary) {
				results += "<" + tag;

				for (var i = 0; i < attrs.length; i++)
					results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
				results += ">";
			},
			end: function (tag) {
				results += "</" + tag + ">";
			},
			chars: function (text) {
				results += text;
			},
			comment: function (text) {
				results += "<!--" + text + "-->";
			}
		});

		return results;
	};

	this.HTMLtoDOM = function (html, doc) {
		// There can be only one of these elements
		var one = makeMap("html,head,body,title");

		// Enforce a structure for the document
		var structure = {
			link: "head",
			base: "head"
		};

		if (!doc) {
			if (typeof DOMDocument != "undefined")
				doc = new DOMDocument();
			else if (typeof document != "undefined" && document.implementation && document.implementation.createDocument)
				doc = document.implementation.createDocument("", "", null);
			else if (typeof ActiveX != "undefined")
				doc = new ActiveXObject("Msxml.DOMDocument");

		} else
			doc = doc.ownerDocument ||
				doc.getOwnerDocument && doc.getOwnerDocument() ||
				doc;

		var elems = [],
			documentElement = doc.documentElement ||
				doc.getDocumentElement && doc.getDocumentElement();

		// If we're dealing with an empty document then we
		// need to pre-populate it with the HTML document structure
		if (!documentElement && doc.createElement) (function () {
			var html = doc.createElement("html");
			var head = doc.createElement("head");
			head.appendChild(doc.createElement("title"));
			html.appendChild(head);
			html.appendChild(doc.createElement("body"));
			doc.appendChild(html);
		})();

		// Find all the unique elements
		if (doc.getElementsByTagName)
			for (var i in one)
				one[i] = doc.getElementsByTagName(i)[0];

		// If we're working with a document, inject contents into
		// the body element
		var curParentNode = one.body;

		HTMLParser(html, {
			start: function (tagName, attrs, unary) {
				// If it's a pre-built element, then we can ignore
				// its construction
				if (one[tagName]) {
					curParentNode = one[tagName];
					if (!unary) {
						elems.push(curParentNode);
					}
					return;
				}

				var elem = doc.createElement(tagName);

				for (var attr in attrs)
					elem.setAttribute(attrs[attr].name, attrs[attr].value);

				if (structure[tagName] && typeof one[structure[tagName]] != "boolean")
					one[structure[tagName]].appendChild(elem);

				else if (curParentNode && curParentNode.appendChild)
					curParentNode.appendChild(elem);

				if (!unary) {
					elems.push(elem);
					curParentNode = elem;
				}
			},
			end: function (tag) {
				elems.length -= 1;

				// Init the new parentNode
				curParentNode = elems[elems.length - 1];
			},
			chars: function (text) {
				curParentNode.appendChild(doc.createTextNode(text));
			},
			comment: function (text) {
				// create comment node
			}
		});

		return doc;
	};

	function makeMap(str) {
		var obj = {}, items = str.split(",");
		for (var i = 0; i < items.length; i++)
			obj[items[i]] = true;
		return obj;
	}
})();
