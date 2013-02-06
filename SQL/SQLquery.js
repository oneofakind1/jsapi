jQuery(function() {
	var counter = 0;
	SQLcheckChildCount()
	jQuery('.rule').live( 'click', function(e){		
		switch(jQuery(e.target).attr("class")){
			case 'plus':
				counter++;						
				var newItem = jQuery(this).clone();			
				newItem.insertAfter(this).attr('id', 'rule' + counter);
				jQuery(':input','#rule' + counter)
				 .not(':button, :submit, :reset, :hidden')
				 .val('')
				 .removeAttr('checked')
				 .removeAttr('selected');
				 
				 //Update the SQL Operator dropdown for this row
				 SQLfindFieldType(newItem[0].children[0]);
				break;
			case 'minus':
				jQuery(this).remove();	
				break;	
			case 'minus disabled':
				break;
		}
			SQLcheckChildCount();
		}
		
	);
});

function SQLcheckChildCount(){
	if(jQuery("#rule-group").children().size() >= 2){
		jQuery("#rule-group .rule .minus").removeClass("disabled");
	} else {
		jQuery("#rule-group .rule .minus").addClass("disabled");
	}
}

function updateSQLqueryFields() {
	//Update the dropdowns with the fields from this layer

	//Remove any additional query levels from previous usages
	jQuery('.rule').each(function (index, row) {
		if (index > 0) {
			jQuery(this).remove();
		}
	});

	//Find the layer in the QueryLayers list
	var layerId = jQuery("#SQLLayerList").val();
	var success = false;
	for (var x = 0; x < feMap.SQLquery.layers.length; x++) {
		var layer = feMap.SQLquery.layers[x];
		if (layer.id == layerId) {
			success = true;
			feMap.SQLquery.activeLayerIdx = x;
			break;
		}
	}
	if (!success) {
		alert("unable to find the matching query layer");
		return null;
	} else if (layer.attributes == null) {
		alert("no attributes defined for this layer");
		return null;
	}

	//Add the layer's fields to the Fields dropdown (use the alias if specified) and
	//update the outFields array for the query
	jQuery(".SQLField").empty();
	feMap.SQLquery.outFields = [];
	for (var y = 0; y < layer.attributes.length; y++) {
		var field = layer.attributes[y];
		feMap.SQLquery.outFields.push(field.name);
		if (field.query) {
			var alias = field.alias || field.name;
			var option = new Option(alias, field.name);
			jQuery(".SQLField").append(option);
		}
	}

	//Populate the SQL Operator and SQL Text dropdowns for the first attribute
	var fieldType = layer.attributes[0].type;
	var SQLOperator = jQuery("#rule")[0].children[1];
	var SQLText = jQuery("#rule")[0].children[2];	
	populateSQLOperator(fieldType, SQLOperator, SQLText);
	
}

function populateSQLOperator(fieldType, SQLOperator, SQLText) {

	//Clear the text input box
	SQLText.value = ("");
	jQuery(SQLText).removeClass("feNumeric");
	
	//Add the appropriate values (eg less than, starts with) in the SQL Operator dropdown
	if (fieldType in inArray(["esriFieldTypeInteger", "esriFieldTypeInteger", "esriFieldTypeSmallInteger", "esriFieldTypeDouble", "esriFieldTypeSingle", "esriFieldTypeOID"])) {
	
		//Add SQL operators relevant for numbers
		jQuery(SQLOperator).empty();
		jQuery(SQLOperator).append(new Option("equals", "="));
		jQuery(SQLOperator).append(new Option("does not equal", "!="));
		jQuery(SQLOperator).append(new Option("is less than", "<")); //TODO should this be LIKE?
		jQuery(SQLOperator).append(new Option("is greater than", ">"));
		
		//Enforce numeric values for the text field
		jQuery(SQLText).addClass("feNumeric");
		
	} else if (fieldType == "esriFieldTypeString") {
	
	
		//Add SQL operators relevant for text
		jQuery(SQLOperator).empty();
		jQuery(SQLOperator).append(new Option("is", "="));
		jQuery(SQLOperator).append(new Option("is not", "<>"));
		jQuery(SQLOperator).append(new Option("contains", "contains")); //TODO should this be LIKE?
		jQuery(SQLOperator).append(new Option("starts with", "starts with"));
		jQuery(SQLOperator).append(new Option("ends with", "ends with"));
	} else {
		alert("layer type not supported in Select by Attributes");
	}
	
}      	

function SQLfindFieldType(row) {
	//Find the layer in the QueryLayers list
	var layer = feMap.SQLquery.layers[feMap.SQLquery.activeLayerIdx];
	
	//Find the selected field
	var fieldId = row.options[row.options.selectedIndex].value;
	
	//Find the text box for this row
	var SQLText = row.parentNode.children[2];
	
	//Find the relevant SQL Operator for this row and populate it with the relevant values
	//depending on whether it's numeric or string
	var SQLOperator = row.parentNode.children[1];
	var success = false;
	for (var x = 0; x < layer.attributes.length; x++) {
		var field = layer.attributes[x];
		if (field.name == fieldId) {
			success = true;
			var fieldType = field.type;
			populateSQLOperator(fieldType, SQLOperator, SQLText);
			break;
		}
	}
	if (!success) {
		alert("unable to find the matching query layer");
		return null;
	}
}

function SQLshowResults(results) {
	jQuery("#btnSQLsubmit").removeClass("loading");
	console.log(results.features.length + " features found");
}

function SQLerror(error) {
	jQuery("#btnSQLsubmit").removeClass("loading");
	alert(error);

}
