'use strict';
var request = require('sync-request');
var data=require('./config.js');
var AWS = require('aws-sdk');
var _ = require('underscore');
AWS.config.region = 'eu-west-1';
AWS.config.update({accessKeyId: data.accessKeyId,secretAccessKey: data.secretAccessKey});
var s3Client = new AWS.S3();
var Q = require('q');
var getImageIdsFromDocument = require('./get-image-ids-from-document');

var imagePaths;

const BUCKET_ORIGIN = 'content-test-published';
const BUCKET_DEPLOY = 'qti-content.adaptemy.com';

const COURSES = {
  course1: {
    courseId: 1,
    publisherID: 1,
    XPUBLISHER: 'MTox',
    authoringToken: '21aca137061533a75b2959414af8f4b2',
    qaToken: 'ab5a4581cb887fb969b12f172e1c90b0'
  },
  course3: {
    courseId: 3,
    publisherID: 3,
    XPUBLISHER: 'Mzoz',
    authoringToken: 'b8689a764314ee9e102b9f295e6881cb',
    qaToken: 'cf2ac91031854e313daf28aca05fbaf1'
  },
  course5: {
    courseId: 5,
    publisherID: 3,
    XPUBLISHER: 'Nzoz',
    authoringToken: '1890e34dacf371153de0d2fa44794900',
    qaToken: '884d71c5d55fe4a5da678e59f20d9fe4'
  },
  course4: {
    courseId: 4,
    publisherID: 4,
    XPUBLISHER: 'NTo0',
    authoringToken: 'ed3e6165900166b7155b4866c9159060',
    qaToken: 'e30b7badd92a42d378e30574f60fc08b'
  }
};

var course;

init();

function init(){
  var courseId = process.argv[2];
  course = COURSES['course'+courseId];

  var concepts = getConcepts();

  getImagePaths()
  .then(function(iP){
    imagePaths = iP;
    // var requiredPaths = imagePaths.filter(function(path){
    //   return path.indexOf('99920a13-c871-4d4e-8728-75853f4b1db6') > -1;
    // });
    // console.log(requiredPaths);
    transferDocuments(concepts);
  });
}

function getConceptDocumentPair(conceptId){
  var documentsRes = request("GET", "http://authoringapi-test.adaptemy.com/api/solo/questions?concept_id="+ conceptId +"&course_id=" + course.courseId, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+course.authoringToken,
                "X-Publisher": course.XPUBLISHER
            }
    });
    var documentInfo = JSON.parse(documentsRes.getBody('utf8')).data;
    var documentId = documentInfo.documentId;

    return {conceptId: conceptId,
            documentId: documentId
           };
}

function getConcepts(){
  var conceptsRes = request('GET', 'http://api-qa.adaptemy.com/api/concepts?course_id='+course.courseId, {
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer "+course.qaToken,
        "X-Publisher": course.XPUBLISHER
    }
  });
  var data = JSON.parse(conceptsRes.getBody('utf8')).data;
  data = data.filter(e => e.source === 'QTI');
  return data;
}

function transferDocuments(concepts){
  concepts.forEach(function(concept){
    // if (concept.conceptId !== '391374d5-df87-467f-99c0-cbdb4a50c756'){
    //   return;
    // }
    transferDocument(concept.conceptId);
  });
}


function transferDocument(conceptId){
  console.log('conceptId',conceptId);
  var pair = getConceptDocumentPair(conceptId);
  saveVariableFileToS3(pair);
  var documentId = pair.documentId;
  var documentFileName = course.publisherID + '/'+ course.courseId + '/'+  documentId + '/'+'content.xml';
  getFileFromS3(BUCKET_ORIGIN,documentFileName)
  .then(function(response){
    var doc = response.Body.toString('utf-8');
    var imageIds = getImageIdsFromDocument(doc);
    var imagePathsInDocument = imagePaths.filter(function(imgDetails){
      return imageIds.some(function(id){
        return imgDetails.includes(id);
      });
    });
    //console.log(imageIds, imagePathsInDocument);
    imagePathsInDocument.forEach(function(imagePath){
      //allow for the same image multiple times in a document
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
      doc = doc.replace('"pid:::image:::'+getImageId(imagePath)+'"', '"'+ 'https://'+ BUCKET_DEPLOY + '/' + imagePath +'"');
    });

    saveContentXMLInNewBucket(doc,conceptId);

    var imageCopyPromises = imagePathsInDocument.map(copyImageToNewBucket);
    return Q.all(imageCopyPromises);
  });
}

function saveContentXMLInNewBucket(doc,conceptId){
  var contentDocument = doc;
  var docFileName = 'qa/' + course.publisherID + '/'+ course.courseId + '/'+  conceptId + '/'+'content.xml';
  saveFileToS3(BUCKET_DEPLOY,docFileName,contentDocument);
  return;
}

function copyImageToNewBucket(imgDetails){
  return copyObjectS3(imgDetails);
}

function getImagePaths(){
  var deferred = Q.defer();
  var options = {
    bucket: BUCKET_ORIGIN,
    prefix: 'assets/'+course.publisherID + '/'+ course.courseId + '/assets/image/'
  };
  listKeys(options, callback);

  function callback(error, keys){
    deferred.resolve(keys);
  }
  return deferred.promise;
}


function getFileFromS3(bucket,fileDocumentName){
 var params = { Bucket: bucket, Key: fileDocumentName };
 var getObjectPromised = s3Client.getObject(params).promise();
 return getObjectPromised;
}

function saveFileToS3(bucket,key,content){    
  var params = {
    Body: content, 
    Bucket: bucket, 
    Key: key
  };

  return s3Client.putObject(params, function(err) {
    if (err){
      console.log('ERROR '+ bucket + key + err);
    }else{
      console.log('The file has been update correctly:'+ key);
    }
  });
}

function copyObjectS3(file){
    var params = {
                  Bucket: BUCKET_DEPLOY,
                  CopySource: BUCKET_ORIGIN + '/' + file,
                  Key: file
    };
    
    s3Client.copyObject(params, function(copyErr){
      if (copyErr) {
        console.log(copyErr);
      }
      else {
        //console.log('Copied: ', params.Key);
      }
    });       
}


function saveVariableFileToS3(pair){
  var documentId = pair.documentId;
  var variablizationFileName = course.publisherID + '/'+ course.courseId + '/'+  documentId + '/'+'content.variablization';
  getFileFromS3(BUCKET_ORIGIN,variablizationFileName)
  .then(function(variablization){
    var key,content="";
    key = 'qa/' + course.publisherID + '/'+ course.courseId + '/'+ pair.conceptId+ '/'+ 'content.variablization';
    content = variablization.Body.toString('utf-8');
    if (content !== "\"\""){
      //console.log('variablization',content,'done');
      //console.log('conceptId',pair.conceptId);
      //console.log('documentId',pair.documentId);
    }    
    return saveFileToS3(BUCKET_DEPLOY,key,content);
  },
  function(){
    var key = 'qa/' + course.publisherID + '/'+ course.courseId + '/'+ pair.conceptId+ '/'+ 'content.variablization';
    return saveFileToS3(BUCKET_DEPLOY,key,'""');
  });
}

function getImageId(imagePath){
  return imagePath.match(/\/([^\/]*)\..*/)[1];
}

var AWS = require('aws-sdk');

 
// Create an S3 client.
//
// This will pick up the default credentials you have set up, such as
// via a credentials file in the standard location, or environment
// variables. See:
// http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
//var s3Client = new AWS.S3();
 
// How many keys to retrieve with a single request to the S3 API.
// Larger key sets require paging and multiple calls. 1000 is a 
// sensible value for near all uses.
var maxKeys = 1000;
 
/**
 * List keys from the specified bucket.
 * 
 * If providing a prefix, only keys matching the prefix will be returned.
 *
 * If providing a delimiter, then a set of distinct path segments will be
 * returned from the keys to be listed. This is a way of listing "folders"
 * present given the keys that are there.
 *
 * @param {Object} options
 * @param {String} options.bucket - The bucket name.
 * @param {String} [options.prefix] - If set only return keys beginning with
 *   the prefix value.
 * @param {String} [options.delimiter] - If set return a list of distinct
 *   folders based on splitting keys by the delimiter.
 * @param {Function} callback - Callback of the form function (error, string[]).
 */
function listKeys (options, callback) {
  var keys = [];
 
  /**
   * Recursively list keys.
   *
   * @param {String|undefined} marker - A value provided by the S3 API
   *   to enable paging of large lists of keys. The result set requested
   *   starts from the marker. If not provided, then the list starts
   *   from the first key.
   */
  function listKeysRecusively (marker) {
    options.marker = marker;
 
    listKeyPage(
      options,
      function (error, nextMarker, keyset) {
        if (error) {
          return callback(error, keys);
        }
 
        keys = keys.concat(keyset);
 
        if (nextMarker) {
          listKeysRecusively(nextMarker);
        } else {
          callback(null, keys);
        }
      }
    );
  }
 
  // Start the recursive listing at the beginning, with no marker.
  listKeysRecusively();
}
 
/**
 * List one page of a set of keys from the specified bucket.
 * 
 * If providing a prefix, only keys matching the prefix will be returned.
 *
 * If providing a delimiter, then a set of distinct path segments will be
 * returned from the keys to be listed. This is a way of listing "folders"
 * present given the keys that are there.
 *
 * If providing a marker, list a page of keys starting from the marker
 * position. Otherwise return the first page of keys.
 *
 * @param {Object} options
 * @param {String} options.bucket - The bucket name.
 * @param {String} [options.prefix] - If set only return keys beginning with
 *   the prefix value.
 * @param {String} [options.delimiter] - If set return a list of distinct
 *   folders based on splitting keys by the delimiter.
 * @param {String} [options.marker] - If set the list only a paged set of keys
 *   starting from the marker.
 * @param {Function} callback - Callback of the form 
    function (error, nextMarker, keys).
 */
function listKeyPage (options, callback) {
  var params = {
    Bucket : options.bucket,
    Delimiter: options.delimiter,
    Marker : options.marker,
    MaxKeys : maxKeys,
    Prefix : options.prefix
  };
 
  s3Client.listObjects(params, function (error, response) {
    if (error) {
      return callback(error);
    } else if (response.err) {
      return callback(new Error(response.err));
    }
 
    // Convert the results into an array of key strings, or
    // common prefixes if we're using a delimiter.
    var keys;
    if (options.delimiter) {
      // Note that if you set MaxKeys to 1 you can see some interesting
      // behavior in which the first response has no response.CommonPrefix
      // values, and so we have to skip over that and move on to the 
      // next page.
      keys = _.map(response.CommonPrefixes, function (item) {
        return item.Prefix;
      });
    } else {
      keys = _.map(response.Contents, function (item) {
        return item.Key;
      });
    }
 
    // Check to see if there are yet more keys to be obtained, and if so
    // return the marker for use in the next request.
    var nextMarker;
    if (response.IsTruncated) {
      if (options.delimiter) {
        // If specifying a delimiter, the response.NextMarker field exists.
        nextMarker = response.NextMarker;
      } else {
        // For normal listing, there is no response.NextMarker
        // and we must use the last key instead.
        nextMarker = keys[keys.length - 1];
      }
    }
 
    callback(null, nextMarker, keys);
  });
}