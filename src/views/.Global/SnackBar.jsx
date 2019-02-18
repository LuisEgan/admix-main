import React, { Component } from "react";
import { connect } from "react-redux";
import { resetAsync, toggleSnackbar } from "../../actions/asyncActions";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const smilies = ["😀", "😁", "😎", "🙂", "💪", "👍", "🤘", "✌️"];

class SnackBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      smiley: smilies[Math.floor(Math.random() * smilies.length)],
    };

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    let { dispatch } = this.props;
    const smiley = smilies[Math.floor(Math.random() * smilies.length)];

    dispatch(toggleSnackbar());
    setTimeout(() => {
      dispatch(resetAsync());
      this.setState({ smiley });
    }, 200);
  }

  render() {
    let { isSnackBarOpen, asyncMessage, asyncError, isLoggedIn } = this.props;
    console.log('asyncMessage: ', asyncMessage);
    let { smiley } = this.state;

    let snackbarClass = "";

    if (asyncError) {
      smiley = "😞";
      snackbarClass = "error";
    }

    return (
      <Snackbar
        id="snackbar"
        className={`${snackbarClass} mb`}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={isLoggedIn ? asyncMessage && isSnackBarOpen : false}
        autoHideDuration={5000}
        onClose={this.handleClose}
        ContentProps={{
          "aria-describedby": "message-id",
        }}
        message={
          <span id="message-id">
            {smiley} {asyncMessage || asyncError}
          </span>
        }
        action={
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    );
  }
}

const mapStateToProps = state => {
  const { app, async } = state;

  return {
    ...app,
    ...async,
  };
};

export default connect(mapStateToProps)(SnackBar);
