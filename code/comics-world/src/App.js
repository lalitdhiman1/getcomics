import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

constructor(){
  super();
  this.state = {
    comics:""
  }
}


componentDidMount(){
fetch('http://localhost:8080/getMainComics').then(results => {
  return results.json()
}).then(data=>{
  let thumbs = data.data.map((pic)=>{
    return (
       <div key={pic.id} className="thumbs">
      <a href={"http://localhost:8080/getcom/"+pic.id+pic.url} target="_blank"><img src={pic.src} />
      <span>{pic.title}</span></a>
      </div>

      )
  })
  this.setState({comics:thumbs})
  console.log(thumbs)
})
}


  render() {
    return (
      <div className="App">
        {this.state.comics}
      </div>
    );
  }
}

export default App;
