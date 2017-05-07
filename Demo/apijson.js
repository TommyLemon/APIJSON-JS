/**
 * Created by Tommy on 17/5/8.
 */

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


/**请求
 * @param url
 * @param rq
 */
function request(url, rq) {
    var method = url.substring(url.lastIndexOf("/") + 1, url.length);
    // alert("method=" + method);
    if (method == null || Method.contains(method) == false) {
        alert("method is empty! url must endsWith \"/[method]\" !");
        return;
    }
    var isGet = method === Method[0] || method === Method[1];
    // alert("isGet=" + isGet);

    var METHOD = method.toUpperCase();

    alert("Request(" + METHOD + "):\n" + rq);


    var request = new XMLHttpRequest();
    request.open(method, url + "/" + (isGet ? rq : ""));
    request.onreadystatechange = function () {
        if(request.readyState !== 4) {
            return;
        }

        if(request.status === 200){
            alert("Response(" + METHOD + "):\n" + format(request.responseText));
        } else {
            alert("Response(" + METHOD + "):\nstatus" + request.status + "\nerror:" + request.error);
        }
    }

    request.send(isGet ? null : rq);
}

/**格式化JSON串
 * @param json
 */
function format(json) {
    return JSON.stringify(JSON.parse(json), null, "\t");
}