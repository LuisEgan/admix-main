import React, { Component } from "react";
import { connect } from "react-redux";
import { snackbarToggle } from "../../actions";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const smilies = ["😀", "😁", "😎", "🙂", "💪", "👍", "🤘", "✌️"];

class SnackBar extends Component {
   constructor(props) {
      super(props);

      this.state = {
         smiley: smilies[Math.floor(Math.random() * smilies.length)]
      };

      this.handleClick = this.handleClick.bind(this);
      this.handleClose = this.handleClose.bind(this);
   }

   handleClick() {
      dispatch(snackbarToggle());
   }

   handleClose() {
      let { dispatch } = this.props;
      const smiley = smilies[Math.floor(Math.random() * smilies.length)];

      dispatch(snackbarToggle());
      setTimeout(() => {
         this.setState({ smiley });
      }, 200);
   }

   render() {
      let { isSnackBarOpen, asyncData, asyncError, isLoggedIn } = this.props;
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
               horizontal: "right"
            }}
            open={isLoggedIn ? isSnackBarOpen : false}
            autoHideDuration={5000}
            onClose={this.handleClose}
            ContentProps={{
               "aria-describedby": "message-id"
            }}
            message={
               <span id="message-id">
                  {smiley} {asyncData ? asyncData.mssg[0].msg || asyncData.mssg : ""}
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

const mapStateToProps = state => ({
   isSnackBarOpen: state.app.get("isSnackBarOpen"),
   userData: state.app.get("userData"),
   asyncData: state.app.get("asyncData"),
   asyncError: state.app.get("asyncError"),
   asyncLoading: state.app.get("asyncLoading"),
   counter: state.app.get("counter"),
   accesstoken: state.app.get("accesstoken"),
   userImgURL: state.app.get("userImgURL"),
   isLoggedIn: state.app.get("isLoggedIn")
});

export default connect(mapStateToProps)(SnackBar);
