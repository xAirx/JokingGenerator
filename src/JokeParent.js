import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import uuid from "uuid/v4";
import "./joke.scss";

class JokeParent extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };

  constructor(props) {
    super(props);
    // Get this from localstorage and parse it, else return empty array.
        this.state = {
          jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
          loading: false
        };
    // Making sure that we load existing jokes into our set
    // so that we can compare to new ones.
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    console.log(this.seenJokes);
    this.handleVote = this.handleVote.bind(this);
    this.getJokes = this.getJokes.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    // Making sure that we dont overwrrite the existing jokes in localstorage on page refresh
    if (this.state.jokes.length === 0) {
      this.getJokes();
      /*  console.log("Jokes are empty");
      console.log("Im getting jokes");
      this.setState({ isLoaded: false });
      setInterval(() => {
        this.getJokes();
        this.setState({ isLoaded: true });
      }, 1000); */
    } /* else {
      console.log("Jokes are not empty");
      console.log("isloaded is true");
      this.setState({ isLoaded: true });
    } */
  }

  handleClick() {
    //Setting state and runing getJokes as a callback when state is done being set.
    this.setState({ loading: true }, this.getJokes);
    //this.getJokes();
  }

  async getJokes() {
    try {
      console.log("COMPONENT DID MOUNT ");
      // load jokes
      // we are using this array to push the jokes into from the response of the axios.get
      let jokes = [];
      // We are looping over jokes.length compared to the prop set to 10, so we only grab 10 jokes at a time
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" }
        });
        //pushing jokes into array, as an object.
        // Setting the unique ID here when we are pushing our data object into our state.
        //So this is going to wait until the state is actually updated once that finishes.
        //This will be called which is going to take everything in this dot state DOT jokes and save it to local
        //storage.

        ////////// CHECKING FOR UNIQUE JOKES WITH OUR SET /////////
        // This plays together with using a forloop to check for jokes.length
        //So we didn't reject it and not load another alternate joke because then we would have forty nine items.
        /* We just kept looping in the while loop and that's why I didn't hardcode as a for loop.
        We made it a while loop so that if we do find a duplicate we're using jokes at length.
        So jokes that length isn't going to grow it's not going to increase.
        So this loop is going to keep looping until
        We actually get 10 new jokes. */

        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuid(), text: newJoke, votes: 0 });
        } else {
          console.log("FOUND A DUPLICATE", newJoke);
        }
      }

      ////////////////// MERGING OLD JOKES WITH NEW JOKES
      // Setting state with our jokes array
      // oldstate is grabbed
      //we set state to an existing previous array of jokes and all the new jokes
      // That we just got from fetching from our API
      this.setState(
        st => ({
          loading: false,
          jokes: [...st.jokes, ...jokes]
        }),
        // Passing in funtion that runs after set state  finishes
        //Saving jokes to localstorage to make sure votes are also saved in localStorage
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  ////////// This function is triggered by the onclick from our child joke.js

  handleVote(id, delta) {
    // Logic to handle votes based on ID
    //Check based on id from joke.js which joke needs to get a vote +1 or deducted.
    console.log(
      "this is the ID recieved in jokelist.js",
      id,
      "it was sent from ",
      delta
    );
    ////////Sending data to state and updating state
    console.log("Handlevote triggered from jokelist.js");

    // Here we are setting state, passing in ID from onclick handler in the child component
    // We are doing the callback form, updating jokes in state comparing it to the old state
    // we return the existing joke, but set the votes and the delta on top.
    // the delta will increase or decrement the votecount...
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
        // Passing in funtion that runs after set state  finishes
        //Saving jokes to localstorage to make sure votes are also saved in localStorage
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  render() {
    ////// With an ifstatement here we can conditionally render what is returned fist.
    // This is why the spinner fills the entire screen here.
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">loading....</h1>
        </div>
      );
    }
    //console.log(this.state);
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Jokes</span>
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            New jokes
          </button>
        </div>

        <div className="JokeList-jokes">
          {/* Mapping over Joke Array to grab data and display. */}
          {/*  {this.state.loading ? ( */}
          <div>
            {jokes.map(j => (
              <Joke
                key={j.id}
                id={j.id}
                votes={j.votes}
                text={j.text}
                jokes ={this.state.jokes}
                //handleVote={this.handleVote}
                upvote={() => this.handleVote(j.id, 1)}
                downvote={() => this.handleVote(j.id, -1)}
              />
            ))}
          </div>
          {/*  ) : (
            <div className="loader" />
          )} */}
        </div>
      </div>
    );
  }
}

export default JokeParent;
