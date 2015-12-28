# Backbone-FormView
FormView is a simple mechanism to help creating form in the BackboneJS
## Example

```javascript
var formOBJ = {
	action : "http://www.example.com/test",
	method : "post",
	// form inputs
	inputs : {
		username : {
			type    : "text",
			default : "test",
			label   : "Username"
		},
		password : {
			type  : "password",
			label : "password"
		}
	}
};
var formView = new Backbone.FormView( { form : formOBJ } );
$("#form-container").html( formView.render() );
```
