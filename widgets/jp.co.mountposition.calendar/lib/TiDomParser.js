var Node = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};

TiDomParser = function() {
  this.initialize.apply(this, arguments);
};
TiDomParser.prototype = {
  initialize: function() {
  },

  dom2Json: function(root) {
    this.__force_array = {};
    if (this.force_array) {
      for (var i = 0; i < this.force_array.length; i++) {
        this.__force_array[this.force_array[i]] = 1;
      }
    }

    var json = this._parseElement(root); // parse root node
    if (this.__force_array[root.nodeName]) {
      json = [json];
    }
    if (root.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
      var tmp = {};
      tmp[root.nodeName] = json; // root nodeName
      json = tmp;
    }
    return json;
  },

  _parseElement: function(elem) {
    if (elem.nodeType == Node.COMMENT_NODE) {
      return;
    }

    if (elem.nodeType == Node.TEXT_NODE || elem.nodeType == Node.CDATA_SECTION_NODE) {
      var bool = elem.textContent.match(/[^\x00-\x20\u00A0]/);
      if (bool == null) return; // ignore white spaces
      return elem.textContent;
    }

    var retval;
    var cnt = {};
    //  parse attributes
    if (elem.attributes && elem.attributes.length) {
      retval = {};
      for (var i = 0, len = elem.attributes.length; i < len; i++) {
        var key = elem.attributes.item(i).nodeName;
        if (typeof(key) != "string") continue;
        var val = elem.attributes.item(i).nodeValue;
        if (!val) continue;
        if (typeof(cnt[key]) == "undefined") cnt[key] = 0;
        cnt[key]++;
        this._addNode(retval, key, cnt[key], val);
      }
    }

    //  parse child nodes (recursive)
    if (elem.childNodes && elem.childNodes.length) {
      var textonly = true;
      if (retval) textonly = false; // some attributes exists
      for (var i = 0, len = elem.childNodes.length; i < len && textonly; i++) {
        var ntype = elem.childNodes.item(i).nodeType;
        if (ntype == Node.TEXT_NODE || ntype == Node.CDATA_SECTION_NODE) continue;
        textonly = false;
      }
      if (textonly) {
        if (!retval) retval = "";
        for (var i = 0, len = elem.childNodes.length; i < len; i++) {
          retval += elem.childNodes.item(i).textContent;
        }
      } else {
        if (!retval) retval = {};
        for (var i = 0, len = elem.childNodes.length; i < len; i++) {
          var key = elem.childNodes.item(i).nodeName;
          if (typeof(key) != "string") continue;
          var val = this._parseElement(elem.childNodes.item(i));
          if (!val) continue;
          if (typeof(cnt[key]) == "undefined") cnt[key] = 0;
          cnt[key]++;
          this._addNode(retval, key, cnt[key], val);
        }
      }
    }
    return retval;
  },

  _addNode: function(hash, key, cnts, val) {
    if (this.__force_array[key]) {
      if (cnts == 1) hash[key] = [];
      hash[key][hash[key].length] = val; // push
    } else if (cnts == 1) { // 1st sibling
      hash[key] = val;
    } else if (cnts == 2) { // 2nd sibling
      hash[key] = [hash[key], val];
    } else { // 3rd sibling and more
      hash[key][hash[key].length] = val;
    }
  }
};

TiDomParser.VERSION = 0.1;

module.exports = TiDomParser;