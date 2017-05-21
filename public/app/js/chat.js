var add_recipient = function(msg, icon){
    $('.padding').append(`<div class='chat-message chat-message-recipient'>
                            <i class="fa ${icon} fa-3x" aria-hidden="true"></i>
                            <div class='chat-message-wrapper'>
                                <div class='chat-message-content joint'>
                                    <p>${msg}</p>
                                </div>
                            </div>
                        </div>`);
}

var add_sender = function(msg, icon){
    $('.padding').append(`<div class='chat-message chat-message-sender'>
                            <i class="fa ${icon} fa-3x" aria-hidden="true"></i>
                            <div class='chat-message-wrapper'>
                                <div class='chat-message-content joint'>
                                    <p>${msg}</p>
                                </div>
                            </div>
                        </div>`);
}

