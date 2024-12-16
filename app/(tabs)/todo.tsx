import { StyleSheet, TextInput } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { View, Button, FlatList } from "react-native";
import * as FileSystem from "expo-file-system";
import { shareAsync, SharingOptions } from "expo-sharing";
import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';
const isWeb = Platform.OS === 'web';

const Todo = ({ text, onDelete }) => {
  return (
    <TouchableOpacity onPress={onDelete}>
      <View
        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
      >
        <Text style={{ color: "#fff" }}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function TabTwoScreen() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);

  const addTodo = () => {
    if (text.trim() !== "") {
      setTodos([...todos, { id: Date.now(), text }]);
      setText("");
    }
  };

  const deleteTodo = (id: any) => {
    setTodos(todos.filter((todo: any) => todo.id !== id));
  };

  const createCSVFile = async (data, fileName) => {
    try {
      const filePath = `${FileSystem.documentDirectory}/${fileName}.csv`;
      const fileContent = data;

      await FileSystem.writeAsStringAsync(filePath, fileContent);
      console.log("CSV file created successfully:", filePath);
    } catch (error) {
      if (isWeb) {
        alert("Error creating CSV file: this feature works only on Android and IOS devices");
        return;
      }
      console.error("Error creating CSV file:", error);
    }
  };

  const prepareCSV = (): string => {
    const columns = "Task,Date\n";
    let items = "";
    
    todos.forEach((todo: any) => {
      items += `${todo.text}, ${new Date().getDate()}\n`;
    });
    return columns + items;
  };

  const createCSV = () => {
    if (todos.length) {
      const data = prepareCSV();
      createCSVFile(data, `my_tasks_${new Date().getDate()}`);
      return;
    }
    if (isWeb) {
      alert("Create at least 1 task, please.");
      return;
    }
  };

  const sharingCSV = async (filePath) => {
    try {
      const shareOptions: SharingOptions = {
        dialogTitle: "MyFile",
      };
      const url = `file://${filePath}`;
      await shareAsync(url, shareOptions);
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  const shareCSV = async () => {
    const filePath = `${
      FileSystem.documentDirectory
    }/my_tasks_${new Date().getDate()}.csv`;
    sharingCSV(filePath);
  };

  return (
    <ThemedView style={styles.todoContainer}>
      <IconSymbol
        size={100}
        color='#808080'
        name='chevron.left.forwardslash.chevron.right'
      />
      <TextInput
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          color: "#fff",
        }}
        placeholder='Add a todo'
        value={text}
        onChangeText={setText}
      />
      <View style={{ flexDirection: "column" }}>
        <View style={{ marginBottom: 8 }}>
          <Button title='Add' onPress={addTodo} />
        </View>
        <View style={{ marginBottom: 8 }}>
          <Button title='Make CSV' onPress={createCSV} />
        </View>
        <View style={{ marginBottom: 8 }}>
          <Button title='Share CSV' onPress={shareCSV} />
        </View>
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <Todo text={item.text} onDelete={() => deleteTodo(item.id)} />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  todoContainer: {
    flexDirection: "column",
    marginTop: 80,
    paddingInline: 16,
    paddingBottom: "100%",
  },
});
