function caeser_shift(plain_text) {
    alert(plain_text);
}

function viginere_cipher(plain_text) {
    alert(plain_text);
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
        var cipher_type = $("#cipher-type").val();
        var plain_text = $("#cipher-plaintext").val();
        var extra_info = $('#extra-cipher-info').val();
        if(cipher_type == 0) {
            caeser_shift(plain_text)
        } else if(cipher_type == 1) {
            viginere_cipher(plain_text)
        } else if(cipher_type == 2 && $('#encrypt').is(':checked')) {
            var multiplier = parseInt($('#affine-shift-multiply').val());
            var additive = parseInt($('#affine-shift-add').val());
            var ascii_plain_text = string_to_ascii_array(plain_text);
            var ascii_cipher_text = encode_affine_shift(ascii_plain_text, multiplier, additive);
            var cipher_text = ascii_array_to_string(ascii_cipher_text);
            $('#cipher-ciphertext').val(cipher_text);
        }
    });

    // Event Handler triggered when 'cipher-type' value changes
    $('#cipher-type').on('change', function(e) {
        var cipher_type = $("#cipher-type").val();
        if(cipher_type == 0) {
            $("#affine-shift-text-area").hide();
            $('#extra-cipher-info').show();
            $('#extra-cipher-info').attr('placeholder', 'Shift amount goes here');
        }
        else if(cipher_type == 2) {
            $("#affine-shift-text-area").show();
            $('#extra-cipher-info').hide();
        } else {
            $('#extra-cipher-info').css('visibility', 'hidden');
        }
    });
});
