var CHAT = CHAT || {};

CHAT = {
  username    : null,
  firstScroll : true,
  hideMessage : null,
  init        : function(){
    this.bind();
    this.sockets.init();
  },
  bind        : function(){
    this.bindForm();
    this.bindInput();
    this.bindConnect();
    this.bindChangeName();
  },
  bindForm    : function(){
    $('#chatInputForm').submit(function(e){
      e.preventDefault();
      var chatMessage = $('#chatMessage');

      CHAT.sockets.socket.emit('chat message', chatMessage.val());
      chatMessage.val('').trigger('keyup');
      CHAT.scrollWindow();
    });
  },
  bindInput   : function(){
    $('#chatMessage').on('keyup', function(){
      
      var messageLength = $(this).val().length;

      if(messageLength){
        CHAT.disableElement('#chatButton',false);
        CHAT.sockets.socket.emit('user typing');
      } else if (!messageLength){
        CHAT.disableElement('#chatButton',true);
      }
    });
  },
  disableElement : function(sel, disable){
    var element = $(sel);
    element.removeClass('disabled').attr('disabled', disable);
  },
  bindConnect : function(){
    $('#chatDisconnect').on('click', function(){
      CHAT.sockets.socket.disconnect();
    });

    $('#chatConnect').on('click', function(){
      CHAT.sockets.socket.connect();
    });
  },
  bindChangeName : function(){
    $('#changeName').on('click', function(){
      CHAT.updateName();
    });
  },
  sockets     : {
    init       : function(){
      CHAT.sockets.socket;
      this.connect();
      this.disconnect();
      this.userJoin();
      this.userLeave();
      this.userTyping();
      this.newMessage();
    },
    socket     : io(),
    connect    : function(){
      CHAT.sockets.socket.on('connect', function(){
        CHAT.showConnect(false);
        username = localStorage.getItem('username') || prompt("Please enter your name");
        
        if(username){
          localStorage.setItem('username', username);
          CHAT.sockets.socket.emit('username', username);
        } else {
          window.location = '/';
        }

        CHAT.disableElement('#chatMessage',false);
        CHAT.disableElement('#chatButton',false);
      });
    },
    disconnect : function(){
      CHAT.sockets.socket.on('disconnect', function(){
        var message = '<em>You disconnected from the room</em>';
        CHAT.postMessage(message);
        CHAT.showConnect(true);
        CHAT.updateUserCount(0);
        CHAT.disableElement('#chatMessage',true);
        CHAT.disableElement('#chatButton',true);
      });
    },
    userJoin   : function(){
      CHAT.sockets.socket.on('user join', function(data){
        var message = '<em>' + data.user + ' joined the room</em>';

        CHAT.postMessage(message);
        CHAT.updateUsersMenu(data.users);
      });
    },
    userLeave  : function(){
      CHAT.sockets.socket.on('user leave', function(data){
        var message = '<em>' + data.user + ' left the room</em>';

        CHAT.postMessage(message);
        CHAT.updateUsersMenu(data.users);
      });
    },
    userTyping : function(){
      CHAT.sockets.socket.on('user typing', function(){
        $('#userTyping').animate({opacity: 1}, 250);
        clearTimeout(CHAT.hideMessage);
        CHAT.hideMessage = setTimeout(function(){
          $('#userTyping').animate({opacity: 0}, 250);
        }, 1000);
      })
    },
    newMessage : function(){
      CHAT.sockets.socket.on('chat stream', function(message){
        var message = '<strong>' + message.user + ':</strong> ' + message.message;
        CHAT.postMessage(message);
      });
    }
  },
  postMessage : function(message){
    var message = $('<p/>', {
      html: message
    }),
      chatWindow = $('#chatWindow'),
      isScrolledToBottom = chatWindow[0].scrollHeight - chatWindow.outerHeight() <= chatWindow.scrollTop() + 1;

    chatWindow.append(message);



    // First, detect if we've scrolled already, then check if the window is scrollable.
    // Otherwise, check if the user is currently scrolled to the bottom, and keep them
    // scrolled to the bottom of hte screen when new messages arrive.

    if(isScrolledToBottom) {
      this.scrollWindow();
    }
  },
  makeLink        : function(text){
    // TODO: Work on this in a bit.
    // var text = "http://www.google.com";
    // var re = new RegExp("^https?://[\w./\?=\(\)#-:@]+");

    // if(re.test(text)){
    //   alert('Hello');
    // }
  },
  scrollWindow    : function(){
    var chatWindow = $('#chatWindow');
    chatWindow[0].scrollTop = chatWindow[0].scrollHeight - chatWindow.outerHeight();
  },
  updateUserCount : function(userCount){
    $('#chatUsers span.userCount').text(userCount);
  },
  updateUsersMenu : function(users){
    var userCount = Object.keys(users).length;
    this.updateUserCount(userCount);

    $('#usersList').empty();
    $.each(users, function(id, name){
      var userItem = $('<li/>')
          .append(
            $('<a/>',{
              href : "#",
              html : name
            }
            )
            );
      $('#usersList').append(userItem);
    });
  },
  updateName: function(){
    localStorage.removeItem('username');
    CHAT.sockets.socket.disconnect();
    setTimeout(function(){
      $('#chatConnect').trigger('click');
    }, 500)
  },
  showConnect : function(show){
    if(show){
      $('#chatConnect').show();
      $('#chatDisconnect').hide();
    } else {
      $('#chatConnect').hide();
      $('#chatDisconnect').show();
    }
  }
}
CHAT.init();






