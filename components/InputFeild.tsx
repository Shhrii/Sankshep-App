import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface InputFieldProps {
  label: string;
  icon?: React.ReactNode;
  inputType?: 'password' | 'text';
  keyboardType?: TextInputProps['keyboardType'];
  fieldButtonLabel?: string;
  fieldButtonFunction?: () => void;
  textChange: (text: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  inputType = 'text',
  keyboardType = 'default',
  fieldButtonLabel,
  fieldButtonFunction,
  textChange,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(inputType === 'password');

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        placeholder={label}
        placeholderTextColor="#999" 
        keyboardType={keyboardType}
        style={styles.input}
        secureTextEntry={inputType === 'password' && isPasswordVisible}
        onChangeText={textChange}
      />
      {inputType === 'password' && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
        >
          <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
        </TouchableOpacity>
      )}
      {fieldButtonLabel && fieldButtonFunction && (
        <TouchableOpacity onPress={fieldButtonFunction} style={styles.fieldButton}>
          <Text style={styles.fieldButtonText}>{fieldButtonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 25,
    backgroundColor: '#F9F9F9',
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 7,
    fontSize: 14,
    color: '#000', // Text color
  },
  eyeIcon: {
    paddingHorizontal: 5,
  },
  fieldButton: {
    marginLeft: 10,
  },
  fieldButtonText: {
    color: '#000',
    fontWeight: '700',
  },
});

export default InputField;
