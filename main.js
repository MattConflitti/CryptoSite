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

function vigenere_cipher(plain_text, key, isEncrypt) {
    var output = "";
    for (var i = 0; i < plain_text.length; i++) {
        idx = 0;
        if(isEncrypt) {
            idx = (A.indexOf(plain_text[i])+A.indexOf(key[i%key.length])) % A.length;
        } else {
            idx = (A.indexOf(plain_text[i])-A.indexOf(key[i%key.length])) % A.length;
        }
        output += A[idx];
    }
    return output;
}

// Accepts string as argument and returns array of ascii values
function string_to_ascii_array(plain_text) {
    char_array = plain_text.split("");
    for(char in char_array) {
        char_array[char] = char_array[char].charCodeAt(0);
    }
    return char_array;
}

// Accepts ascii array and returns its alphanumeric representation
function ascii_array_to_string(ascii_array){
    for(i in ascii_array){
        ascii_array[i] = String.fromCharCode(ascii_array[i]);
    }
    return ascii_array.join("");
}

/* Plug every ascii value in the plaintext into user-given equation
Ascii table for js goes from 0-126, but 0-31 are reserved for special
non-printable chars.  So we mod 95 (127 - 32) and then add 32.
This allows are ascii values to span between 32 and 126            */
function encode_affine_shift(ascii_plain_text, multiplier, additive) {
    var ascii_cipher_text = [];
    for(num in ascii_plain_text) {
        ascii_cipher_text.push(((multiplier*ascii_plain_text[num] + additive) % 95)+ 32);
    }
    return ascii_cipher_text
}


$(function() {
    // Event Handler triggered 'submit-cipher' button is clicked
    $("#submit-cipher").click(function() {
        var encrypted = false;
        var cipher_type = $("#cipher-type").val();
        var plain_text = $("#cipher-plaintext").val();
        var cipher_text = $('#cipher-ciphertext').val();
        var extra_info = $('#extra-cipher-info').val();
        enc_data = {};
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
            alert(plain_text)
        } else if(cipher_type == 1 && $('#encrypt').is(':checked')) {
            var key = $('#vigenere-key').val();
            cipher_text = vigenere_cipher(plain_text, key, true);
            enc_data = {
                'key':key
            };
            encrypted = true;
        } else if(cipher_type == 1 && $('#decrypt').is(':checked')) {
            var key = $('#vigenere-key').val();
            plain_text = vigenere_cipher(cipher_text, key, false);
            alert(plain_text);
        } else if(cipher_type == 2 && $('#encrypt').is(':checked')) {
            var multiplier = parseInt($('#affine-shift-multiply').val());
            var additive = parseInt($('#affine-shift-add').val());
            enc_data = {
                'multiplier':multiplier,
                'additive':additive
            };
            var ascii_plain_text = string_to_ascii_array(plain_text);
            var ascii_cipher_text = encode_affine_shift(ascii_plain_text, multiplier, additive);
            var cipher_text = ascii_array_to_string(ascii_cipher_text);
            $('#cipher-ciphertext').val(cipher_text);
            encrypted = true;
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
