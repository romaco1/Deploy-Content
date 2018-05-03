
module.exports = function(doc){
  var fullMatches = doc.match(/src="pid:::image:::([^"]*)"/g);
  if (!fullMatches){
  //if there are no images in the document, return an empty array
  	return [];
  }
  return fullMatches.map(function(fullMatch){
  	return fullMatch.match(/src="pid:::image:::([^"]*)"/)[1];
  });
};