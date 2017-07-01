/**
 * Created by Lemon on 17/5/8.
 */

var url_base = "http://139.196.140.118:8080";
var url_get = url_base + "/get";
var url_head = url_base + "/head";
var url_post_get = url_base + "/post_get";
var url_post_head = url_base + "/post_head";
var url_post = url_base + "/post";
var url_put = url_base + "/put";
var url_delete = url_base + "/delete";


/**包含
 * @param obj
 * @returns {boolean}
 */
Array.prototype.contains = function (obj) {
    for (var i = 0; i < this.length; i ++) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

/**请求方法
 * @type {Array}
 */
var Method = new Array(

    /**
     * 常规获取数据方式
     */
    "get",

    /**
     * 检查，默认是非空检查，返回数据总数
     */
    "head",

    /**
     * 通过POST来GET数据，不显示请求内容和返回结果，一般用于对安全要求比较高的请求
     */
    "post_get",

    /**
     * 通过POST来HEAD数据，不显示请求内容和返回结果，一般用于对安全要求比较高的请求
     */
    "post_head",

    /**
     * 新增(或者说插入)数据
     */
    "post",

    /**
     * 修改数据，只修改传入字段对应的值
     */
    "put",

    /**
     * 删除数据
     */
    "delete"
)

String.prototype.contains = function (c) {
    return this.indexOf(c) >= 0;
}


/**请求
 * @param url                 请求地址
 * @param json                请求内容
 * @param notAlert            不弹窗显示
 * @param callBack            请求成功回调
 * @returns {XMLHttpRequest}
 */
function request(url, json, notAlert, callBack) {
    if (json == null || (json instanceof Object) == false) {
        alertOfDebug("request   json == null || (json instanceof Object) == false !!! >> return null;");
        return null;
    }

    if (url == null || (typeof url != "string")) {
        alertOfDebug("request   url == null || typeof url != string !!! >> return null;");
        return null;
    }
    if (url.length < 3 || url.contains(".") == false) {
        alertOfDebug("request   url.length < 3 || url.contains(.) == false !!! >> return null;");
        return null;
    }
    //TODO 这里应该用正则表达式
    if (url.indexOf("http://") != 0 && url.indexOf("https://") != 0) {
        alertOfDebug("request   url.indexOf(http://) != 0 && url.indexOf(https://) != 0 >> url = http:// + url;");
        url = "http://" + url;
    }


    var rqf = format(json);

    var rq = encodeURI(JSON.stringify(encode(json))); // JSON.stringify(encode(json)); //


    var method = url.substring(url.lastIndexOf("/") + 1, url.length);
    // alertOfDebug("method=" + method);
    if (method == null || Method.contains(method) == false) {
        alertOfDebug("method is empty! url must endsWith \"/[method]\" !");
        // /login, /register 等都走POST   return null;
    }
    var isGet = method === Method[0] || method === Method[1];
    // alertOfDebug("isGet=" + isGet);

    var METHOD = method.toUpperCase();

    if (! notAlert) {
        alertOfDebug("Request(" + METHOD + "):\n" + rqf);
    }


    //原生请求<<<<<<<<<<<<<<<<<<<<<<<<<<
    var request = new XMLHttpRequest();
    request.open(isGet ? "GET" : "POST", url + (isGet ? "/" + rq : ""), true);
    if (isGet == false) {
        request.setRequestHeader("Content-type", "application/json");
    }
    request.onreadystatechange = function () {
        if (request.readyState !== 4) {
            return;
        }

        if (request.status === 200) {
            if (! notAlert) {
                alertOfDebug("Response(" + METHOD + "):\n" + format(request.responseText));
            }

            if (callBack != null) {
                callBack();
                return;
            }
        } else {
            alertOfDebug("Response(" + METHOD + "):\nstatus:" + request.status + "\nerror:" + request.error);
        }
    }

    request.send(isGet ? null : rq);
    //原生请求>>>>>>>>>>>>>>>>>>>>>>>>>>


    //JQuery ajax请求<<<<<<<<<<<<<<<<<<<<<<<<<<
    // $.ajax({
    //     type: isGet ? "GET" : "POST",
    //     url: isGet ? url + "/" + rq : url,
    //     contentType: "application/json", //必须
    //     dataType: "json", //返回值类型，非必须
    //     data: isGet ? null : rq,
    //     success: function (response) {
    //         alertOfDebug(response);
    //     }
    // });
    //JQuery ajax请求>>>>>>>>>>>>>>>>>>>>>>>>>>


    //VUE axios请求<<<<<<<<<<<<<<<<<<<<<<<<<<
    // if (isGet) {
    //     axios.get(url + "/" + rq, null)
    //         .then(function (response)    {
    //             console.log(response);
    //         })
    //         .catch(function (error) {
    //             console.log(error);
    //         });
    // } else {
    //     axios({
    //         method: 'post',
    //         url: url + "/",
    //         data: json
    //     }).then(function (response) {
    //         alertOfDebug(response);
    //     }).catch(function (error) {
    //         alertOfDebug(error);
    //     });
    // }
    //VUE axios请求>>>>>>>>>>>>>>>>>>>>>>>>>>


    return request;
}

/**编码JSON，转义所有String
 * @param json 任意类型
 */
function encode(json) {
    // alertOfDebug("encode  before:\n" + format(JSON.stringify(json)));

    if (typeof json == "string") { //json instanceof String) {
        json = encodeURIComponent(json);
    }
    else if (json instanceof Array) {
        // alertOfDebug("encode  json instanceof Array");

        for (var i = 0; i < json.length; i ++) {
            // alertOfDebug("json[" + i + "] = " + format(JSON.stringify(json[i])));
            json[i] = encode(json[i]);
        }
    }
    else if (json instanceof Object) {
        // alertOfDebug("encode  json instanceof Object");
        for (var key in json) {
            // alertOfDebug("encode  json[" + key + "] = " + format(JSON.stringify(json[key])));
            json[key] = encode(json[key]);
        }
    }
    // alertOfDebug("encode  after:\n" + format(JSON.stringify(json)));

    return json;
}


/**格式化JSON串
 * @param json {}，JSON对象
 */
function format(json) {
    if ((json instanceof Object) == false) {
        alertOfDebug("format  json instanceof Object == false >> json = parseJSON(json);");
        json = parseJSON(json);
    }

    return JSON.stringify(json, null, "\t");
}

/**将json字符串转为JSON对象
 * @param s
 */
function parseJSON(s) {
    if (s instanceof Object) {
        alertOfDebug("parseJSON  s instanceof JSON >> return s;");
        return s;
    }

    if (typeof s != "string") {
        alertOfDebug("parseJSON  typeof json != string >> s = \"\" + s;");
        s = "" + s;
    }
    // alertOfDebug("parseJSON  s = \n" + s);

    return JSON.parse(s);
}

/**测试用的提示
 * @param s
 */
function alertOfDebug(s) {
    alert(s); //注释掉就都不会弹窗了
}






//常用请求<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<



/**获取单个对象
 * @param table    String, 对象名，如 "User"
 * @param id       Long, 对象id，如 1
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function getObject(table, id, notAlert, callBack) {
    alertOfDebug("getObject  table = " + table + "; id = " + id);

    return request(url_get, newSingleJSON(table, { "id": id }, null), notAlert, callBack);
}

/**获取数组
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param count    int, 每页数量
 * @param page     int, 页码
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function getArray(table, json, count, page, notAlert, callBack) {
    alertOfDebug("getArray  table = " + table + "; count = " + count + "; page = " + page
        + "; json = \n" + format(json));

    return request(url_get, newArrayJSON(table, json, count, page), notAlert, callBack);
}

/**新增单个对象
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function postObject(table, json, notAlert, callBack) {
    alertOfDebug("postObject  table = " + table
        + "; json = \n" + format(json));
    if (json == null) {
        alertOfDebug('POST 请求必须设置 table对象 ！');
        return;
    }
    if (json['id'] != null) {
        alertOfDebug('POST 请求不能设置 id ！');
        return;
    }

    return request(url_post, newSingleJSON(table, json, table), notAlert, callBack);
}
/**修改单个对象
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function putObject(table, json, notAlert, callBack) {
    alertOfDebug("putObject  table = " + table
        + "; json = \n" + format(json));
    if (json == null) {
        alertOfDebug('PUT 请求必须设置 table对象 ！');
        return;
    }
    if (json["id"] == null || json["id"] <= 0) {
        alertOfDebug('PUT 请求必须设置 id 且 id > 0 ！');
        return;
    }

    return request(url_put, newSingleJSON(table, json, table), notAlert, callBack);
}
/**删除单个对象
 * @param table    String, 对象名，如 "User"
 * @param id       Long, 对象id，如 1
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function deleteObject(table, id, notAlert, callBack) {
    alertOfDebug("deleteObject  table = " + table + "; id = " + id);
    if (id == null || id <= 0) {
        alertOfDebug('DELETE 请求必须设置 id 且 id > 0 ！');
        return;
    }

    return request(url_delete, newSingleJSON(table, { "id": id }, table), notAlert, callBack);
}

/**修改多个对象
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function putArray(table, json, notAlert, callBack) {
    alertOfDebug("putArray  table = " + table
        + "; json = \n" + format(json));
    if (json == null) {
        alertOfDebug('PUT 请求必须设置 table对象 ！');
        return;
    }
    if (json["id{}"] == null) {
        alertOfDebug('PUT 请求必须设置 id{} ！');
        return;
    }

    return request(url_put, newSingleJSON(table, json, table + "[]"), notAlert, callBack);
}
/**删除多个对象
 * @param table    String, 对象名，如 "User"
 * @param idArray  [], 对象id数组，如 [1, 2, 3]
 * @param notAlert 不弹窗显示
 * @param callBack 请求成功回调
 */
function deleteArray(table, idArray, notAlert, callBack) {
    alertOfDebug("deleteArray  table = " + table
        + "; idArray = \n" + format(idArray));
    if (idArray == null) {
        alertOfDebug('DELETE 请求必须设置 id{} ！');
        return;
    }

    return request(url_delete, newSingleJSON(table, { "id{}": idArray }, table + "[]"), notAlert, callBack);
}



/**新建单个对象请求
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param tag      String, 写操作标识，一般来说，操作单个对象时和table相同，操作多个对象时是 table[]
 */
function newSingleJSON(table, json, tag) {
    // alertOfDebug("newSingleJSON  table = " + table + "; tag = " + tag
    //     + "; json = \n" + format(json));

    return parseJSON(newSingleString(table, json, tag));
}
/**新建数组请求
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param count    int, 每页数量
 * @param page     int, 页码
 */
function newArrayJSON(table, json, count, page) {
    // alertOfDebug("newArrayJSON  table = " + table + "; count = " + count + "; page = " + page
    //     + "; json = \n" + format(json));

    return parseJSON(newArrayString(table, json, count, page));
}


/**新建单个对象请求
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param tag      String, 写操作标识，一般来说，操作单个对象时和table相同，操作多个对象时是 table[]
 */
function newSingleString(table, json, tag) {
    // alertOfDebug("newSingleString  table = " + table + "; tag = " + tag
    //     + "; json = \n" + format(json));

    return "{\""
        + table + "\":"
        + JSON.stringify(json)
        + (tag == null || tag == '' ? "" : ",\"tag\":\"" + tag + "\"")
        + "}";
}
/**新建数组请求
 * @param table    String, 对象名，如 "User"
 * @param json     {}, 对象内容，如 {"sex":1}
 * @param count    int, 每页数量
 * @param page     int, 页码
 */
function newArrayString(table, json, count, page) {
    // alertOfDebug("newArrayString  table = " + table + "; count = " + count + "; page = " + page
    //     + "; json = \n" + format(json));

    return "{\"" + table + "[]\":{" + "\"count\":" + count + "," + "\"page\":" + page + ",\""
        + table + "\":" + JSON.stringify(json) + "}}";
}


//常用请求>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>