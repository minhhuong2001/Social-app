import { Text } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import { getAllChatWithFriendId } from "../api/chatApi";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
// import socket from "../utils/socket";

const Header = ({ navigation, friend }) => {
  const goBack = () => {
    navigation.goBack();
  };
  const imageSource =
    friend?.avatar != null ? {} : require("../assets/user.png");
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={goBack}>
        <Ionicons name="chevron-back" size={24} color={"#3b5998"} />
      </TouchableOpacity>

      <View style={{ flexDirection: "row" }}>
        <Image source={imageSource} style={styles.friendAvatar} />
        <Text
          style={{
            fontSize: 24,
            marginLeft: 10,
          }}
        >
          {friend.username}
        </Text>
      </View>
    </View>
  );
};

const SingleMessage = React.memo(({ message, isFriend }) => {
  return (
    <View
      style={{
        marginTop: 10,
        alignItems: "center",
        flexDirection: "row",
        width: "100%",
      }}
    >
      {!isFriend && <Text style={{ flex: 1 }}></Text>}
      {isFriend && <UserAvatar />}
      <Text
        style={{
          borderWidth: 1,
          borderColor: "black",
          fontSize: 16,
          borderRadius: 15,
          padding: 5,
          maxWidth: "50%",
        }}
      >
        {message.content}
      </Text>
    </View>
  );
});

const InputMessage = ({ handleSendMessage }) => {
  const [message, setMessage] = useState("");
  return (
    <TextInput
      placeholder="Input your chat ..."
      onSubmitEditing={() => {
        handleSendMessage({ message: message });
        setMessage("");
      }}
      value={message}
      onChangeText={(text) => setMessage(text)}
    />
  );
};

const UserAvatar = ({ userImage }) => {
  const imageSource = require("../assets/user.png");
  return (
    <Image
      source={imageSource}
      style={{
        height: 30,
        width: 30,
      }}
    />
  );
};

const PrivateChatScreen = ({ navigation, route }) => {
  const [chats, setChats] = useState([]);
  const room = route.params.room;
  const friendId = room?.friend._id;
  const token = useSelector((store) => store?.token);
  const socket = useSelector((store) => store?.socket);

  useEffect(() => {
    socket.on("message", (msg) => {
      setChats((previousChats) => [msg, ...previousChats]);
    });
  }, []);

  const handleSendMessage = ({ message }) => {
    socket.emit("chatmessage", {
      token: token,
      receiverId: friendId,
      content: message,
    });
  };

  useLayoutEffect(() => {
    getAllChatWithFriendId({
      token: token,
      friendId: friendId,
    }).then((res) => {
      if (res.isSuccess) {
        setChats(res.data.reverse());
      } else {
        console.log("Fetch chat for room error");
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} friend={room.friend} />

      <View style={{ flex: 1 }}>
        <FlatList
          inverted={true}
          data={chats}
          key={(item) => {
            item.index;
          }}
          renderItem={(item) => {
            return (
              <SingleMessage
                message={item.item}
                isFriend={item.item.senderId == friendId}
                index={item.index}
              />
            );
          }}
        />
      </View>

      <View style={styles.inputChat}>
        <InputMessage handleSendMessage={handleSendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    padding: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderWidth: 1,
    radius: 15,
  },
  container: {
    height: "100%",
  },
  chatArea: {
    borderWidth: 1,
    borderColor: "black",
    flex: 1,
  },
  inputChat: {
    height: 30,
    borderWidth: 1,
    borderColor: "black",
  },
});

export default PrivateChatScreen;
