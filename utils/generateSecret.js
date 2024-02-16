require('crypto').randomBytes(48, function(err, buffer) 
{
    var secret = buffer.toString('hex');
    console.log(secret);
});
  