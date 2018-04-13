METHODS = [
    'Caesar',
    'Vigenere',
    'Affine Shift'
]

A = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*() -_=+,./;:'\"[{}]";

function caeser_shift(plain_text, amount) {
    var amount = parseInt(amount);
    var output = "";
    for (var i = 0; i < plain_text.length; i++) {
        idx = (A.indexOf(plain_text[i])+amount) % A.length;
        if(idx < 0) {
            idx = idx + A.length;
        }
        output += A[idx];
    }
    return output;
}

function in_alphabet(phrase) {
    for (var i = 0; i < phrase.length; i++) {
        if(!(A.includes(phrase[i]))){
            return false;
        }
    }
    return true;
}

function vigenere_cipher(plain_text, key, isEncrypt) {
    var output = "";
    for (var i = 0; i < plain_text.length; i++) {
        idx = 0;
        if(isEncrypt) {
            idx = (A.indexOf(plain_text[i])+A.indexOf(key[i%key.length])) % A.length;
        } else {
            idx = (A.indexOf(plain_text[i])-A.indexOf(key[i%key.length]) + A.length) % A.length;
        }
        output += A[idx];
    }
    return output;
}

// https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
  }

// https://stackoverflow.com/questions/26985808/calculating-the-modular-inverse-in-javascript
function xgcd(a, b) { 
    console.log(a)
    console.log(b)

    if (b == 0) {
      return [1, 0, a];
    }
 
    temp = xgcd(b, a % b);
    x = temp[0];
    y = temp[1];
    d = temp[2];
    return [y, x-y*Math.floor(a/b), d];
  }

function affine_shift(plain_text, a, b, isEncrypt) {
    var output = "";
    for (var i = 0; i < plain_text.length; i++) {
        idx = 0;
        var c = A.indexOf(plain_text[i]);
        var d = xgcd(a, A.length)[0];
        if(d < 0) {
             d += A.length;
         }     
        
        if(isEncrypt) {
            idx=(c*a + b)%A.length;
        } else {
            idx=((d*(c-b))+d*A.length)%A.length;
        }
        output += A[idx];
    }
    return output
}

$(function() {
    $("#alphabet").html(`Cipher Alphabet:<br>${A}`)

    // Event Handler triggered 'submit-cipher' button is clicked
    $("#submit-cipher").click(function() {
        var encrypted = false;
        var cipher_type = $("#cipher-type").val();
        var plain_text = $("#cipher-plaintext").val();
        var cipher_text = $('#cipher-ciphertext').val();
        var extra_info = $('#extra-cipher-info').val();
        enc_data = {};

        if(plain_text.length == 0 && $('#encrypt').is(':checked')) {
            alert("Fill in plaintext!");
            return;
        }
        if(cipher_text.length == 0 && $('#decrypt').is(':checked')) {
            alert("Fill in ciphertext!");
            return;
        }

        if(!in_alphabet(plain_text) && $('#encrypt').is(':checked')) {
            alert("Plaintext must be within cipher alphabet!");
            return;
        }                   
        
         if(!in_alphabet(cipher_text) && $('#decrypt').is(':checked')) {
            alert("Ciphertext must be within cipher alphabet!");
            return;
        }           
        
        if(cipher_type == 0 && $('#encrypt').is(':checked')) {
            cipher_text = caeser_shift(plain_text, extra_info)
            console.log("extra info" + extra_info);
            enc_data = {
                'shift':3
            };
            encrypted = true;
        } else if (cipher_type == 0 && $('#decrypt').is(':checked')){
            plain_text = caeser_shift(cipher_text, extra_info * -1)
            console.log(extra_info * -1)
            $('#cipher-plaintext').val(plain_text);
            alert("Plaintext: " + plain_text)
        } else if(cipher_type == 1 && $('#encrypt').is(':checked')) {
            var key = $('#vigenere-key').val();
            cipher_text = vigenere_cipher(plain_text, key, true);
            enc_data = {
                'key':key
            };
            if(!in_alphabet(key)){
                alert("Key must be within the cipher alphabet!");
                return;
            }
            encrypted = true;
        } else if(cipher_type == 1 && $('#decrypt').is(':checked')) {
            var key = $('#vigenere-key').val();
            plain_text = vigenere_cipher(cipher_text, key, false);
            $('#cipher-plaintext').val(plain_text);
            if(!in_alphabet(key)){
                alert("Key must be within the cipher alphabet!");
                return;
            }            
            alert("Plaintext: " + plain_text);
        } else if(cipher_type == 2 && $('#encrypt').is(':checked')) {
            var multiplier = parseInt($('#affine-shift-multiply').val());
            var additive = parseInt($('#affine-shift-add').val());
            if(!(isInt(multiplier) && isInt(additive))) {
                alert("Fill in both parameters!");
                return;
            }

            if(xgcd(multiplier,A.length)[2] != 1) {
                alert("Pick multiplier with inverse mod "+ A.length +".");
            } else {
                enc_data = {
                    'multiplier':multiplier,
                    'additive':additive
                };
                var cipher_text = affine_shift(plain_text,multiplier,additive,true);
                $('#cipher-ciphertext').val(cipher_text);
                
                encrypted = true;
            }
        } else if(cipher_type == 2 && $('#decrypt').is(':checked')) {
            var multiplier = parseInt($('#affine-shift-multiply').val());
            var additive = parseInt($('#affine-shift-add').val());
            if(xgcd(multiplier,A.length)[2] != 1) {
                alert("Pick multiplier with inverse mod "+ A.length +".");
            } else {
                var plain_text = affine_shift(cipher_text,multiplier,additive,false);
                $('#cipher-plaintext').val(plain_text);
                alert("Plaintext: " + plain_text);
            }
        }

        if(encrypted) {
            var postsRef = firebase.database().ref('posts');
            var newPostRef = postsRef.push();
            newPostRef.set({
                'user_id': firebase.auth().currentUser.uid,
                'date': new Date().getTime(),
                'text': cipher_text,
                'type': cipher_type,
                'enc_data': enc_data
            });
        }
    });

    // Event Handler triggered when 'cipher-type' value changes
    $('#cipher-type').on('change', function(e) {
        var cipher_type = $("#cipher-type").val();
        if(cipher_type == 0) {
            $("#affine-shift-text-area").hide();
            $('#extra-cipher-info').show();
            $('#vigenere-text-area').hide();
            $('#extra-cipher-info').attr('placeholder', 'Shift amount goes here');
        }
        else if(cipher_type == 1) {
            $("#affine-shift-text-area").hide();
            $('#extra-cipher-info').hide();
            $('#vigenere-text-area').show();
        }
        else if(cipher_type == 2) {
            $("#affine-shift-text-area").show();
            $('#extra-cipher-info').hide();
            $('#vigenere-text-area').hide();
        } else {
            $('#extra-cipher-info').hide();
        }
    });


    //update wall
    var ref = firebase.database().ref("posts");
    ref.on('value', function(snapshot){
        $('#postwall').empty();
        var posts = Object.values(snapshot.val());
        posts.sort(function(a, b) {
            a = new Date(a.date);
            b = new Date(b.date);
            return a>b ? -1 : a<b ? 1 : 0;
        });
        console.log(posts);
        
        max_posts = 30;
        for(var i =0;i<max_posts;i++) {
            var post = posts[i];
            if(post == undefined) {
                break;
            }
            if(post.text.length == 0) {
                max_posts++;
                continue;
            }
            post_key = "";
            if(post.type == 0) {
                //caesar
                post_key = `<div class="post_key" style="display:none" data-ciphertext="${post.text}" data-type="${post.type}" data-key="${post.enc_data['shift']}"></div>`;
            } else if(post.type == 1) {
                //vigenere
                post_key = `<div class="post_key" style="display:none" data-ciphertext="${post.text}" data-type="${post.type}" data-key="${post.enc_data['key']}"></div>`;
            } else if(post.type == 2) {
                //affine
                post_key = `<div class="post_key" style="display:none" data-ciphertext="${post.text}" data-type="${post.type}" data-key="${post.enc_data['multiplier']} ${post.enc_data['additive']}"></div>`;
            }
            $('#postwall').append(
                `<div class="col-6 post">
                    <div>User: ${post.user_id} </div>
                    <div>Date Posted: ${new Date(post.date)} </div>
                    <div>Encryption Method: ${METHODS[post.type]}</div>
                    <div>Ciphertext:
                        <p>${post.text}</p>
                    </div>
                    ${post_key}
                </div>`);
        }

        $('.post').click(function(e) {
            $('html,body').animate({
                scrollTop: 0
            },500);
            $('#form').css('outline', '2px solid #20C20E');
            $('#form-hidden-div').show();
            $('#form-hidden-div').fadeOut(2000, function() {
                $('#form').css('outline', 'none');
            });
            var type = $(this).find('.post_key').data('type');
            var key = $(this).find('.post_key').data('key');
            var ciphertext = $(this).find('.post_key').data('ciphertext');
            if(type == 0) {
                //caesar
                shift = key;
                $("#cipher-type").val(type);
                $("#cipher-type").change();
                $("#cipher-plaintext").val("");
                $('#decrypt').prop('checked', true);
                $('#cipher-ciphertext').val(ciphertext);
                $('#extra-cipher-info').val(shift);
            } else if(type == 1) {
                //vigenere
                $("#cipher-type").val(type);
                $("#cipher-type").change();
                $("#cipher-plaintext").val("");
                $('#decrypt').prop('checked', true);
                $('#cipher-ciphertext').val(ciphertext);
                $('#vigenere-key').val(key);
            } else if(type == 2) {
                //affine
                multiplier = parseInt(key.split(" ")[0]);
                additive = parseInt(key.split(" ")[1]);
                $("#cipher-type").val(type);
                $("#cipher-type").change();
                $("#cipher-plaintext").val("");
                $('#decrypt').prop('checked', true);
                $('#cipher-ciphertext').val(ciphertext);
                $('#affine-shift-multiply').val(multiplier);
                $('#affine-shift-add').val(additive);
            }
        });
            
    });
});
