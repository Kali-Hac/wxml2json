# wxml2json & json2wxml
## 基于HTMLParser的微信小程序wxml-json的解析转换库
## How to use


### node

```sh
$ npm install wxml2json
```

```javascript
var wxml2json = require('wxml2json').wxml2json;
var json2wxml = require('wxml2json').json2wxml;
```


### API

```javascript
json === wxml2json(WXML代码);
wxml === json2wxml(json);

console.assert(json === wxml);
```


### JSON format

every json has `node`

memeber of `node` is

- `root`
- `element`
- `text`
- `comment`

`root` node is the root of JSON, every JSON must have only one root `root`, could have `child`.

`element` node represents html element, could have `tag`, `attr`, `children`.

`text` node represents text element, could have `text`.

`comment` node represents commment element, could have `text`.


### Sample

wxml:

```wxml
<view class="index">
  <view class="index-hd">
    <image class="index-logo" src="resources/kind/logo.png"></image>
    <view class="index-desc">以下将展示小程序官方组件能力，组件样式仅供参考，开发者可根据自身需求自定义组件样式，具体属性参数详见小程序开发文档。</view>
  </view>
  <view class="index-bd">
    <view class="kind-list">
      <block wx:for-items="{{list}}" wx:key="{{item.id}}">
        <view class="kind-list-item">
          <view id="{{item.id}}" class="kind-list-item-hd {{item.open ? 'kind-list-item-hd-show' : ''}}" bindtap="kindToggle">
            <view class="kind-list-text">{{item.name}}</view>
            <image class="kind-list-img" src="resources/kind/{{item.id}}.png"></image>
          </view>
          <view class="kind-list-item-bd {{item.open ? 'kind-list-item-bd-show' : ''}}">
            <view class="navigator-box {{item.open ? 'navigator-box-show' : ''}}">
              <block wx:for-items="{{item.pages}}" wx:for-item="page" wx:key="*item">
                <navigator url="pages/{{page}}/{{page}}" class="navigator">
                  <view class="navigator-text">{{page}}</view>
                  <view class="navigator-arrow"></view>
                </navigator>
              </block>
            </view>
          </view>
        </view>
      </block>
    </view>
  </view>
</view>
```

json:

```javascript
[
    {
        "type": "element",
        "tag": "view",
        "attr": {
            "class": "index"
        },
        "children": [
            {
                "type": "element",
                "tag": "view",
                "attr": {
                    "class": "index-hd"
                },
                "children": [
                    {
                        "type": "element",
                        "tag": "image",
                        "attr": {
                            "class": "index-logo",
                            "src": "resources/kind/logo.png"
                        }
                    },
                    {
                        "type": "element",
                        "tag": "view",
                        "attr": {
                            "class": "index-desc"
                        },
                        "children": [
                            {
                                "type": "text",
                                "text": "以下将展示小程序官方组件能力，组件样式仅供参考，开发者可根据自身需求自定义组件样式，具体属性参数详见小程序开发文档。"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "element",
                "tag": "view",
                "attr": {
                    "class": "index-bd"
                },
                "children": [
                    {
                        "type": "element",
                        "tag": "view",
                        "attr": {
                            "class": "kind-list"
                        },
                        "children": [
                            {
                                "type": "element",
                                "tag": "block",
                                "attr": {
                                    "wx:for-items": "{{list}}",
                                    "wx:key": "{{item.id}}"
                                },
                                "children": [
                                    {
                                        "type": "element",
                                        "tag": "view",
                                        "attr": {
                                            "class": "kind-list-item"
                                        },
                                        "children": [
                                            {
                                                "type": "element",
                                                "tag": "view",
                                                "attr": {
                                                    "id": "{{item.id}}",
                                                    "class": "kind-list-item-hd {{item.open ? 'kind-list-item-hd-show' : ''}}",
                                                    "bindtap": "kindToggle"
                                                },
                                                "children": [
                                                    {
                                                        "type": "element",
                                                        "tag": "view",
                                                        "attr": {
                                                            "class": "kind-list-text"
                                                        },
                                                        "children": [
                                                            {
                                                                "type": "text",
                                                                "text": "{{item.name}}"
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        "type": "element",
                                                        "tag": "image",
                                                        "attr": {
                                                            "class": "kind-list-img",
                                                            "src": "resources/kind/{{item.id}}.png"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "element",
                                                "tag": "view",
                                                "attr": {
                                                    "class": "kind-list-item-bd {{item.open ? 'kind-list-item-bd-show' : ''}}"
                                                },
                                                "children": [
                                                    {
                                                        "type": "element",
                                                        "tag": "view",
                                                        "attr": {
                                                            "class": "navigator-box {{item.open ? 'navigator-box-show' : ''}}"
                                                        },
                                                        "children": [
                                                            {
                                                                "type": "element",
                                                                "tag": "block",
                                                                "attr": {
                                                                    "wx:for-items": "{{item.pages}}",
                                                                    "wx:for-item": "page",
                                                                    "wx:key": "*item"
                                                                },
                                                                "children": [
                                                                    {
                                                                        "type": "element",
                                                                        "tag": "navigator",
                                                                        "attr": {
                                                                            "url": "pages/{{page}}/{{page}}",
                                                                            "class": "navigator"
                                                                        },
                                                                        "children": [
                                                                            {
                                                                                "type": "element",
                                                                                "tag": "view",
                                                                                "attr": {
                                                                                    "class": "navigator-text"
                                                                                },
                                                                                "children": [
                                                                                    {
                                                                                        "type": "text",
                                                                                        "text": "{{page}}"
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                "type": "element",
                                                                                "tag": "view",
                                                                                "attr": {
                                                                                    "class": "navigator-arrow"
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
```


## Dependencies

[htmlparser.js](https://github.com/blowsie/Pure-JavaScript-HTML5-Parser)(wxmlparse.js)

repositry includes this at `lib/` as git subtree.
