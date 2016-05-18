/*


Structure

- CommentBox
    - Comment List
        - Comment 1
        - Comment 2...
    -Comment Form
 */

var data = [
    { id: 1, author: "Peter Johnson", text: "My name is Pete and this is my comment."},
    {id: 2, author: "Jordan Walke", text: "Cool dude."}
];

var CommentBox = React.createClass({ //root component - rendered when server fetches data

    //this.props = immutable component data
    //this.state = mutable component data

    loadCommentsFromServer: function(){
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });


    },

    //when user hits submit, we need to refresh list of comments to include the new one
    handleCommentSubmit: function(comment){

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });



    },

    //called once
    getInitialState: function(){
      return {data: []};
    },

    //called automatically by React after a component is rendered for the first time
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },


    render: function(){ //returns a tree of react components

        return (
            ///'commentBox' is the HTML class for the element
            //get data from function call and pass it along to CommentList
            <div className = "commentBox">
                <h1>Comments:</h1>
                <CommentList  data = {this.state.data}/>
                <CommentForm onCommentSubmit = {this.handleCommentSubmit}/>
            </div> //this is compiled to plain javascript...creates react 'div' elements
        );
    }
});



var CommentForm = React.createClass({

    getInitialState: function () {
        return{author: '', text: ''}
    },

    handleAuthorChange: function(e){
        this.setState({author: e.target.value});
    },

    handleTextChange: function(e){
        this.setState({text: e.target.value});
    },

    handleSubmit: function (e) {
        e.preventDefault();

        var author = this.state.author.trim();
        var text = this.state.text.trim();

        if(!text || !author){
            return;
        }

        //call onCommentSubmit from props (passed in from comment box)
        this.props.onCommentSubmit({author: author, text: text});

        debugger;
        //clear form after submit
        this.setState({author: '', text: ''});
    },

    render: function () {
        return (
            <form className = "commentForm" onSubmit = {this.handleSubmit}>
                <h6>I am a comment form!</h6>
                <input type = "text" placeholder = "Your Name" value = {this.state.author} onChange = {this.handleAuthorChange}/>
                <input type = "text" placeholder="Say Something..." value = {this.state.text} onChange = {this.handleTextChange}/>
                <input type = "submit" value = "Post"/>
            </form>
        );
    }
});

var CommentList = React.createClass({

    render: function(){

        var commentNodes = this.props.data.map(function(comment){ //this variable returns a bunch of comment components from props
           return (

               <Comment author = {comment.author} key = {comment.id}>
                   {comment.text}
               </Comment>
           );
        });

        return (
            <div className = "commentList">
                {commentNodes}
            </div>
        );

    }

});


var Comment = React.createClass({ //child component of CommentList

    rawMarkup: function(){
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return {__html:rawMarkup};
    },

    render: function () { //data from parent can be accessed through 'props'
        return(

            <div className = "comment">
                <h2 className = "commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML = {this.rawMarkup()}/>
            </div>


        )
    }


});

//1st param - root react component, 2nd param - DOM element to stick 1st param into
ReactDOM.render( <CommentBox url = "/api/comments" pollInterval = {2000}/>, document.getElementById('content')); //pass in 'data' to comment box
//url parameter will force component to re-render itself when it comes back from the server