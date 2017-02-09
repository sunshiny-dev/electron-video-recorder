var blobToUri, saveURL, trigger,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
var Whammy = require('whammy');
var fs = require('fs');
var FFmpeg = require('fluent-ffmpeg');

saveURL = function(file, uri) {
    var base64Data  =   uri.replace(/^data:video\/webm\;base64,/, "");
    base64Data += base64Data.replace('+', ' ');
    binaryData = new Buffer(base64Data, 'base64').toString('binary');
    fs.writeFileSync(file, binaryData, 'binary', function(err) {
        if (err) throw err;
    });
};

saveBase64 = function(file, type, blob) {
    var buf = new Buffer(blob, 'base64'); // decode
    switch(type) {
        case 'mp4':
            {
                var PassThrough = new require('stream').PassThrough;
                var stream = new PassThrough();
                
                stream.write(buf);
                stream.end();
                FFmpeg(stream)
                .on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function() {
                    console.log('Processing finished !');
                })
                .save(file);
            }
            break;
        case 'webm':
            {
                fs.writeFile(file, buf, function(err) {
                    if (err) throw err;
                });       
            }
            break;
        default:
            console.log('please specify video file type to be recorded.');
            break;
    }
}
  
blobToUri = function(blob, cb) {
    var reader;

    reader = new FileReader;
    reader.readAsDataURL(blob);
    return reader.onload = function(event) {
        return cb(event.target.result);
    };
};

var blobToBase64 = function(blob, cb) {
  var reader = new FileReader();
  reader.onload = function() {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    cb(base64);
  };
  reader.readAsDataURL(blob);
};

var blobToMp4 = function() {
  var reader = new FileReader();
  reader.onload = function() {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    cb(base64);
  };
  reader.readAsArrayBuffer(blob);
}

function Recorder(el, fps) {
    this.fps = fps != null ? fps : 32;
    this.clear = __bind(this.clear, this);
    this.toBlob = __bind(this.toBlob, this);
    this.toDataURL = __bind(this.toDataURL, this);
    this.stop = __bind(this.stop, this);
    this.save = __bind(this.save, this);
    this.start = __bind(this.start, this);
    this.grab = __bind(this.grab, this);
    
    if (el.jquery) {
        this.height = el.height();
        this.width = el.width();
        this.el = el[0];
    } else {
        this.height = el.clientHeight;
        this.width = el.clientWidth;
        this.el = el;
    }
    this.height = el.videoHeight;
    this.width = el.videoWidth;
    
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.interval = 0; //1000 / this.fps;
    this.frames = [];
    this._requested = null;
    this.delta = null;
    this.then = Date.now();
    this.now = null;
    this.type = null;
}

Recorder.prototype.grab = function() {
    var uri;

    this._requested = requestAnimationFrame(this.grab);
    this.now = Date.now();
    this.delta = this.now - this.then; 
    this.fps = 1000 / this.delta;
    //if (this.delta > this.interval) {
        //this.then = this.now - (this.delta % this.interval);
        this.context.drawImage(this.el, 0, 0, this.width, this.height);
        uri = this.canvas.toDataURL('image/webp', 1);
        this.frames.push(uri);
        this.then = this.now;
    //}
    return this;
};

Recorder.prototype.start = function() {
    this.grab();
    return this;
};

Recorder.prototype.save = function(fileName, type) {
    var realName;
    switch(type) {
        case "mp4":
            realName = fileName + ".mp4";
            break;
        case "webm":
            realName = fileName + ".webm";
            break;
        default:
            realName = fileName + ".mp4";
            break;
    }
    this.toBase64(function(err, base64) {
        return saveBase64(realName, type, base64);
    });
    /*this.toDataURL(function(err, uri) {
        return saveURL(fileName, uri);
    });*/
    return this;
};

Recorder.prototype.stop = function() {
    cancelAnimationFrame(this._requested);
    return this;
};

Recorder.prototype.toMp4 = function(cb) {
    
}
Recorder.prototype.toDataURL = function(cb) {
    return this.toBlob(function(err, blob) {
        if (err != null) {
            return cb(err);
        }
        return blobToUri(blob, function(uri) {
            return cb(null, uri);
        });
    });
};

Recorder.prototype.toBase64 = function(cb) {
    return this.toBlob(function(err, blob) {
        if (err != null) {
            return cb(err);
        }
        return blobToBase64(blob, function(base64) {
            return cb(null, base64);
        });
    });
};

Recorder.prototype.toBlob = function(cb) {
    var blob;
        
    blob = Whammy.fromImageArray(this.frames, this.fps);
    return cb(null, blob);
};

Recorder.prototype.clear = function() {
    this.frames = [];
    return this;
};

module.exports = Recorder;