/*=========== In The Name Of Allah ================
* Version   : 1.0.0
* Author    : Saeed Torabi
* Email     : saeed_trb@yahoo.com
* WebSite   : www.saeedtorabi.ir
================================================*/
Backbone.FormView = Backbone.View.extend({
	tagName    : "form",
    options    : {
		name  		: "sample-form"
	},
	events  : {
        "change"                : "change",
        "click .opt-submit"     : "submit",
    },
	form 	   : {},
	values 	   : {},
    inputs     : {},
	initialize : function( options ){
        this.form    = options.form || {};
		this.options = _.extend( {} , this.options , _.omit(options, "form" ) );
	},
    HTMLGenerator   : function( dom ){
        dom = dom || {};

        var fn = arguments.callee; 
        if( _.isArray( dom ) ){ 
            var body = document.createElement("div");
            _.each( dom , function( item , key ) {
                $( body ).append( fn( item ) );
            }); 
            return body.innerHTML;
        }else if( _.isObject( dom ) ){
            var tag = document.createElement( dom.tag );
            if( _.isObject( dom.attr ) ) 
                $(tag).attr( dom.attr );

            if( _.isString( dom.content ) )
                $(tag).text( dom.content );
            else if( _.isObject( dom.content ) )
                $(tag).append( fn( dom.content ) );
            return tag;
        }
    },
	set   : function( change ){
		this.values = _.extend( {} , this.values , change );
        _.each( change , function( val , name ){
            this.trigger("changeInputs" , name , val );
            this.trigger("changeInputs:"+ name , name , val );
        } , this );
        this.updateForm();
	},
	get   : function( name ){
		return this.values[name] || null;
	},
	change: function (event) {
        var target 			= event.target,
            value           = this.getValue( target ),
        	change  		= {};

        change[target.name] = value;
        this.set( change );
        
    },
    getValue : function( element ){
        var change = {};
        switch( element.type ){
            case "select":
            case "select-multiple":
                return $.map( $(element).find("option:selected") , function(a) { return a.value; });
            break;
            case "checkbox":
                return $.map( $.find("[name='"+element.name+"']:checked") , function(a) { return a.value; });
            break;
            case "file" :
                return this.getInputFile( element , function( e ){
                    change[element.name] = e.content;
                    this.set( change );
                });
            break;
            default:
                return $(element).val();
            break;
        }
    },
    getInputFile    : function( files , callback ) {
        if(!files && !files.length) return;

        var file    = files[0],
            self    = this ,
            reader = new FileReader();

        reader.onload = function() {
            var _extension  = file.name.substr( ( file.name.lastIndexOf('.')));
            if( typeof callback == "function")
                callback.apply( self , arguments );
        };
        reader.readAsDataURL( file );
    },
    updateForm : function( inputs ){
    	inputs = inputs || this.values;
    	_.each( inputs , function( val , name ) {
            if( _.isObject( this.inputs[name] ) )
                $(this.inputs[name]).val( val );
    	} , this );
    },
    submit  : function( e ){
        var self    = this,
            $form   = $( e.target ).parents("form");

        var data = this.values;
                
        this.sendRequest({
            type    : $form.attr('method'),
            dataType: 'json',
            data    : JSON.stringify( data ),
            url     : $form.attr('action'),
            complete : function( xhr , statusText ){
                self.trigger( 'completeRequest' ,  xhr , statusText );
            }
        });
        return false;
    },
    sendRequest         : function( options ){
        // Default JSON-request options.
        var params = {
            type        : "GET", 
            dataType    : 'json',
            contentType : 'application/json',
        };
        return Backbone.ajax( _.extend( params , options ) );
    },
    render	: function(){
    	this.$el.html("");
        this.$el.attr( _.omit( this.form , "buttons" , "inputs" ) );
    	
        _.each( this.form.inputs , function( input , name ){
    		this.values[name] = input.default || "";
            this.inputs[name] = this.renderItem.apply( this , arguments );
    		this.$el.append( this.inputs[name] );
    	} , this );

        buttons = _.extend( {
            submit : {
                type    : "submit",
                class   : "btn btn-primary opt-submit",
                default : "Submit"
            }
        } , this.form.buttons || {} );
        _.each( buttons , function( item , name ){
            this.$el.append( this.renderItem.apply( this , arguments ) );
        },this);
        return this.$el;
    },
    getItemId	: function( name ){
    	return this.options.name + "-" + name
    },
    renderItem : function( item , name ){
    	var self 	= this,
    		method 	= "render_" + item.type || '',
            fn      = self[method] || self.default;
        return fn.apply( this , arguments );

    	// if( _.isFunction( self[method] ) ){
    	// 	var fn = self[method];
    	// }else{
    	// 	console.log("Form builder error : mehtod " + method + " is not defined");
    	// 	return '';
    	// }
    },
    renderInput   : function( content , item , name ){
    	var tpl  = {
    		tag 	: "div",
    		attr 	: {
    			class : "form-group"
    		},
    		content : [
    			{
    				tag 	: "label" ,
    				for 	: this.getItemId( name ),
    				content : item.label || ''
    			}
    		]
    	}
    	tpl.content.push( content );
    	return this.HTMLGenerator( tpl );
    },
    render_text : function (  item , name ){
    	var className = "form-control input-sm" + (item.class || "")
    	tplItem = {
    		tag 	: "input",
    		attr	: {
				name	: name,
				id 		: this.getItemId( name ),
				type 	: "text",
				class   : className,
				value 	: item.default || ""
			}
    	};
    	return this.renderInput( tplItem , item , name );
    },
    render_select : function (  item , name ){
    	var className = "form-control input-sm" + (item.class || "")
    	tplItem = {
    		tag 	: "select",
    		attr	: {
				name	: name,
				class   : className,
				id 		: this.getItemId( name )
			},
    		content : []
    	};
    	_.each( item.options , function( label , value ){
    		tplItem.content.push({
    			tag 	: "option",
    			attr	: {
					value	: value
				},
				content : label
    		});
    	});
    	return this.renderInput( tplItem , item , name );
    },
    default : function (  item , name ){
        var className = "form-control input-sm" + (item.class || "")
        tplItem = {
            tag     : "input",
            attr    : {
                name    : name,
                id      : this.getItemId( name ),
                type    : item.type,
                class   : className,
                value   : item.default || ""
            }
        };
        return this.renderInput( tplItem , item , name );
    }
});
