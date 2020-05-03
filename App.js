import React from 'react';
import { View } from 'react-native';
import Game from './components/Game'
    
export default class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View>
        <Game/>
      </View>
    );
  }
}