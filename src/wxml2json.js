
/**
 * 
 * wxml2json改造自: https://github.com/Jxck/html2json
 * 
 * author: Kali-Hac(好葱)
 * organization: SCUT
 * 
 * github地址: https://github.com/Kali-Hac
 * 
 * for: 微信小程序wxml解析
 * detail : wxml2json库是基于html2json库写的，保留原作者的注释
 */
(function(global) {
  DEBUG = false;
  var debug = DEBUG ? console.log.bind(console) : function(){};

  if (typeof module === 'object' && typeof module.exports === 'object') {
    require('../lib/Pure-JavaScript-HTML5-Parser/wxmlparser.js');
  }

  function q(v) {
    return '"' + v + '"';
  }

  //Crucial Change
  function removeDOCTYPE(html) {
    return html
      .replace(/<\?xml.*\?>\n/, '')
      .replace(/<!doctype.*\>/i, '')
      .replace(/<!DOCTYPE.*\>/, '');
  }

  global.wxml2json = function wxml2json(html) {
    html = removeDOCTYPE(html);
    var bufArray = [];
    var results = {
      type: 'root',
      children: [],
    };
    HTMLParser(html, {
      start: function(tag, attrs, unary) {
        debug(tag, attrs, unary);
        // type for this element
        var type = {
          type: 'element',
          tag: tag,
        };
        if (attrs.length !== 0) {
          type.attr = attrs.reduce(function(pre, attr) {
            var name = attr.name;
            var value = attr.value;

            // has multi attibutes
            // make it array of attribute

            //Crucial Change
            // 微信小程序的属性里面可以有变量及代码，可以有空格
            // if (value.match(/ /)) {
            //   value = value.split(' ');
            // }

            // if attr already exists
            // merge it
            if (pre[name]) {
              if (Array.isArray(pre[name])) {
                // already array, push to last
                pre[name].push(value);
              } else {
                // single value, make it array
                pre[name] = [pre[name], value];
              }
            } else {
              // not exist, put it
              pre[name] = value;
            }

            return pre;
          }, {});
        }
        if (unary) {
          // if this tag dosen't have end tag
          // like <img src="hoge.png"/>
          // add to parents
          var parent = bufArray[0] || results;
          if (parent.children === undefined) {
            parent.children = [];
          }
          parent.children.push(type);
        } else {
          bufArray.unshift(type);
        }
      },
      end: function(tag) {
        debug(tag);
        // merge into parent tag
        var type = bufArray.shift();
        if (type.tag !== tag) console.error('invalid state: mismatch end tag');

        if (bufArray.length === 0) {
          results.children.push(type);
        } else {
          var parent = bufArray[0];
          if (parent.children === undefined) {
            parent.children = [];
          }
          parent.children.push(type);
        }
      },
      chars: function(text) {
        debug(text);
        var type = {
          type: 'text',
          text: text,
        };
        if (bufArray.length === 0) {
          //Crucial Change
          if(type.text.replace(/ /g, '').replace(/\r/g, '').replace(/\n/g, '').replace(/\t/g, '') !=='' && type.text!=='')
            results.children.push(type);
        } else {
          var parent = bufArray[0];
          if (parent.children === undefined) {
            parent.children = [];
          }
          //都为空格时不加入节点
          //Crucial Change
          if(type.text.replace(/ /g, '').replace(/\r/g, '').replace(/\n/g, '').replace(/\t/g, '') !=='' && type.text!=='')
            parent.children.push(type);
        }
      },
      comment: function(text) {
        debug(text);
        var type = {
          type: 'comment',
          text: text,
        };
        var parent = bufArray[0];
        //Crucial Change
        parent = !!parent || []
        if (parent.children === undefined) {
          parent.children = [];
        }
        parent.children.push(type);
      },
    });
    return results;
  };

  global.json2wxml = function json2wxml(json) {
    // Empty Elements - HTML 4.01
    var empty = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'image', 'input', 'isindex', 'link', 'meta', 'param', 'embed'];

    var children = '';
    if (json.children) {
      children = json.children.map(function(c) {
        return json2wxml(c);
      }).join('');
    }

    var attr = '';
    if (json.attr) {
      attr = Object.keys(json.attr).map(function(key) {
        var value = json.attr[key];
        if (Array.isArray(value)) value = value.join(' ');
        return key + '=' + q(value);
      }).join(' ');
      if (attr !== '') attr = ' ' + attr;
    }

    if (json.type === 'element') {
      var tag = json.tag;
      if (empty.indexOf(tag) > -1) {
        // empty element
        // Crucial Change
        return '<' + json.tag + attr + '/>\n';
      }

      // non empty element
      // Crucial Change
      var open = '<' + json.tag + attr + '>\n';
      var close = '</' + json.tag + '>\n';
      // Crucial Change
      return open + children + close + '\n';
    }
      // Crucial Change
    if (json.type === 'text') {
      return json.text + '\n';
    }
      // Crucial Change
    if (json.type === 'comment') {
      return '<!--' + json.text + '-->\n';
    }

    if (json.type === 'root') {
      return children;
    }
  };
})(this);
