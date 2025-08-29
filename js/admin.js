jQuery(document).ready(function($) {
    'use strict';

    // Schema type change handler
    $('#gm8_schema_type').on('change', function() {
        var selectedType = $(this).val();
        
        // Hide all schema forms
        $('.schema-form').hide();
        
        // Show the selected schema form
        if (selectedType) {
            $('#' + selectedType + '-form').show();
            $('#schema-preview').show();
            updateSchemaPreview();
        } else {
            $('#schema-preview').hide();
        }
    });

    // Show initial form if schema type is already selected
    var initialType = $('#gm8_schema_type').val();
    if (initialType) {
        $('#' + initialType + '-form').show();
        $('#schema-preview').show();
        updateSchemaPreview();
    }

    // Update preview when form fields change
    $('.schema-form input, .schema-form textarea, .schema-form select').on('input change', function() {
        updateSchemaPreview();
    });

    // Also listen for changes on dynamically added elements
    $(document).on('input change', '.schema-form input, .schema-form textarea, .schema-form select', function() {
        updateSchemaPreview();
    });

    function updateSchemaPreview() {
        var selectedType = $('#gm8_schema_type').val();
        if (!selectedType) return;

        var schemaData = {};
        schemaData[selectedType] = {};

        // Collect form data based on selected type
        $('#' + selectedType + '-form input, #' + selectedType + '-form textarea, #' + selectedType + '-form select').each(function() {
            var $field = $(this);
            var name = $field.attr('name');
            var value = $field.val();

            if (name && value) {
                // Parse the field name to build the data structure
                var parts = name.match(/schema_data\[([^\]]+)\]\[([^\]]+)\](?:\[([^\]]+)\])?(?:\[([^\]]+)\])?/);
                if (parts) {
                    var schemaType = parts[1];
                    var fieldName = parts[2];
                    var subField = parts[3];
                    var subSubField = parts[4];

                    if (subSubField) {
                        if (!schemaData[schemaType][fieldName]) schemaData[schemaType][fieldName] = {};
                        if (!schemaData[schemaType][fieldName][subField]) schemaData[schemaType][fieldName][subField] = {};
                        schemaData[schemaType][fieldName][subField][subSubField] = value;
                    } else if (subField) {
                        if (!schemaData[schemaType][fieldName]) schemaData[schemaType][fieldName] = {};
                        schemaData[schemaType][fieldName][subField] = value;
                    } else {
                        schemaData[schemaType][fieldName] = value;
                    }
                }
            }
        });

        // Debug: Log what we collected
        console.log('Collected form data:', schemaData);

        // Special handling for areaServed to create proper array structure
        if (selectedType === 'Service') {
            var areaServedArray = [];
            var areaData = schemaData[selectedType]['areaServed'] || {};
            
            console.log('Processing areaServed:', areaData);
            
            // Convert the indexed object to an array
            for (var key in areaData) {
                if (areaData.hasOwnProperty(key) && typeof areaData[key] === 'object') {
                    var area = areaData[key];
                    if (area['@type'] && area['name']) {
                        areaServedArray.push({
                            '@type': area['@type'],
                            'name': area['name']
                        });
                    }
                }
            }
            
            console.log('Final areaServed array:', areaServedArray);
            
            if (areaServedArray.length > 0) {
                schemaData[selectedType]['areaServed'] = areaServedArray;
            }
        }

        // Special handling for Organization addresses to create proper array structure
        if (selectedType === 'Organization') {
            var addressArray = [];
            var addressData = schemaData[selectedType]['address'] || {};
            
            console.log('Processing Organization addresses:', addressData);
            
            // Convert the indexed object to an array
            for (var key in addressData) {
                if (addressData.hasOwnProperty(key) && typeof addressData[key] === 'object') {
                    var address = addressData[key];
                    if (address['streetAddress']) {
                        addressArray.push({
                            '@type': address['@type'] || 'PostalAddress',
                            'streetAddress': address['streetAddress'],
                            'addressLocality': address['addressLocality'],
                            'addressRegion': address['addressRegion'],
                            'postalCode': address['postalCode'],
                            'addressCountry': address['addressCountry']
                        });
                    }
                }
            }
            
            console.log('Final Organization address array:', addressArray);
            
            if (addressArray.length > 0) {
                schemaData[selectedType]['address'] = addressArray;
            }
        }

        // Special handling for Person address to create proper object structure
        if (selectedType === 'Person' && schemaData[selectedType]['address']) {
            var personAddress = schemaData[selectedType]['address'];
            if (personAddress['streetAddress']) {
                schemaData[selectedType]['address'] = {
                    '@type': personAddress['@type'] || 'PostalAddress',
                    'streetAddress': personAddress['streetAddress'],
                    'addressLocality': personAddress['addressLocality'],
                    'addressRegion': personAddress['addressRegion'],
                    'postalCode': personAddress['postalCode'],
                    'addressCountry': personAddress['addressCountry']
                };
            }
        }

        // Build the final schema
        var finalSchema = {
            '@context': 'https://schema.org',
            '@type': selectedType
        };

        // Merge in the collected data
        if (schemaData[selectedType]) {
            for (var field in schemaData[selectedType]) {
                if (schemaData[selectedType].hasOwnProperty(field) && schemaData[selectedType][field]) {
                    finalSchema[field] = schemaData[selectedType][field];
                }
            }
        }

        console.log('Final schema:', finalSchema);

        // Update preview
        $('#schema-json-preview').html('<pre>' + JSON.stringify(finalSchema, null, 2) + '</pre>');
        
        // Update action buttons (outside the scrolling preview)
        $('#schema-actions').html(
            '<button type="button" class="button button-secondary open-validator" style="margin-right: 10px;">' +
            '<span class="dashicons dashicons-external" style="margin-right: 5px;"></span>Open Schema.org Validator' +
            '</button>' +
            '<button type="button" class="button button-primary copy-schema">' +
            '<span class="dashicons dashicons-clipboard" style="margin-right: 5px;"></span>Copy Schema Markup' +
            '</button>'
        );
    }

    // Schema action buttons
    $(document).on('click', '.open-validator', function() {
        window.open('https://validator.schema.org/', '_blank');
    });

    $(document).on('click', '.copy-schema', function() {
        var schemaText = $('#schema-json-preview pre').text();
        if (schemaText) {
            // Use the modern clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(schemaText).then(function() {
                    // Show success feedback
                    var $button = $(this);
                    var originalText = $button.html();
                    $button.html('<span class="dashicons dashicons-yes" style="margin-right: 5px;"></span>Copied!');
                    $button.addClass('button-disabled').prop('disabled', true);

                    setTimeout(function() {
                        $button.html(originalText);
                        $button.removeClass('button-disabled').prop('disabled', false);
                    }, 2000);
                }.bind(this)).catch(function(err) {
                    console.error('Failed to copy: ', err);
                    fallbackCopyTextToClipboard(schemaText, this);
                });
            } else {
                // Fallback for older browsers
                fallbackCopyTextToClipboard(schemaText, this);
            }
        }
    });

    // Fallback copy function for older browsers
    function fallbackCopyTextToClipboard(text, buttonElement) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            if (successful) {
                // Show success feedback
                var $button = $(buttonElement);
                var originalText = $button.html();
                $button.html('<span class="dashicons dashicons-yes" style="margin-right: 5px;"></span>Copied!');
                $button.addClass('button-disabled').prop('disabled', true);

                setTimeout(function() {
                    $button.html(originalText);
                    $button.removeClass('button-disabled').prop('disabled', false);
                }, 2000);
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    // Organization logo picker functionality
    $(document).on('click', '.select-logo', function() {
        var $logoInput = $(this).siblings('input[type="hidden"]');
        var $logoPreview = $(this).siblings('.logo-preview');
        var $removeButton = $(this).siblings('.remove-logo');
        
        // Create media frame
        var frame = wp.media({
            title: 'Select Organization Logo',
            button: {
                text: 'Use this logo'
            },
            multiple: false,
            library: {
                type: 'image'
            }
        });

        // When image selected
        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            $logoInput.val(attachment.url);
            $logoPreview.html('<img src="' + attachment.url + '" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 3px;" />');
            $removeButton.show();
            updateSchemaPreview();
        });

        frame.open();
    });

    $(document).on('click', '.remove-logo', function() {
        var $logoInput = $(this).siblings('input[type="hidden"]');
        var $logoPreview = $(this).siblings('.logo-preview');
        $logoInput.val('');
        $logoPreview.empty();
        $(this).hide();
        updateSchemaPreview();
    });

    // Person image picker functionality
    $(document).on('click', '.select-image', function() {
        var $imageInput = $(this).siblings('input[type="hidden"]');
        var $imagePreview = $(this).siblings('.image-preview');
        var $removeButton = $(this).siblings('.remove-image');
        
        // Create media frame
        var frame = wp.media({
            title: 'Select Profile Image',
            button: {
                text: 'Use this image'
            },
            multiple: false,
            library: {
                type: 'image'
            }
        });

        // When image selected
        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            $imageInput.val(attachment.url);
            $imagePreview.html('<img src="' + attachment.url + '" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 3px;" />');
            $removeButton.show();
            updateSchemaPreview();
        });

        frame.open();
    });

    $(document).on('click', '.remove-image', function() {
        var $imageInput = $(this).siblings('input[type="hidden"]');
        var $imagePreview = $(this).siblings('.image-preview');
        $imageInput.val('');
        $imagePreview.empty();
        $(this).hide();
        updateSchemaPreview();
    });

    // Organization address repeater functionality
    var addressIndex = 0;
    
    // Initialize addressIndex based on existing addresses
    function initializeAddressIndex() {
        var existingAddresses = $('#org-addresses-container .address-item').length;
        addressIndex = existingAddresses;
    }
    
    // Call on page load
    initializeAddressIndex();
    
    $(document).on('click', '.add-address', function() {
        var container = $('#org-addresses-container');
        var existingCount = container.find('.address-item').length;
        var labelText = existingCount > 0 ? 'Address ' + (existingCount + 1) : 'Address';
        
        var newAddress = $('<div class="address-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 3px; background: #f9f9f9;">' +
            '<h5 style="margin: 0 0 10px 0; color: #23282d;">' + labelText + '</h5>' +
            '<select name="schema_data[Organization][address][' + addressIndex + '][@type]" class="regular-text" style="width: 100%; margin-bottom: 10px;">' +
            '<option value="PostalAddress" selected>Postal Address</option>' +
            '<option value="Place">Place</option>' +
            '</select>' +
            '<input type="text" name="schema_data[Organization][address][' + addressIndex + '][streetAddress]" placeholder="Street Address" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<input type="text" name="schema_data[Organization][address][' + addressIndex + '][addressLocality]" placeholder="City" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<input type="text" name="schema_data[Organization][address][' + addressIndex + '][addressRegion]" placeholder="State/Region" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<input type="text" name="schema_data[Organization][address][' + addressIndex + '][postalCode]" placeholder="Postal Code" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<select name="schema_data[Organization][address][' + addressIndex + '][addressCountry]" class="regular-text" style="width: 100%; margin-bottom: 10px;">' +
            '<option value="">-- Select Country --</option>' +
            '<option value="US">United States</option>' +
            '<option value="GB">United Kingdom</option>' +
            '<option value="CA">Canada</option>' +
            '<option value="AU">Australia</option>' +
            '<option value="DE">Germany</option>' +
            '<option value="FR">France</option>' +
            '<option value="IT">Italy</option>' +
            '<option value="ES">Spain</option>' +
            '<option value="NL">Netherlands</option>' +
            '<option value="BE">Belgium</option>' +
            '<option value="CH">Switzerland</option>' +
            '<option value="AT">Austria</option>' +
            '<option value="SE">Sweden</option>' +
            '<option value="NO">Norway</option>' +
            '<option value="DK">Denmark</option>' +
            '<option value="FI">Finland</option>' +
            '<option value="PL">Poland</option>' +
            '<option value="CZ">Czech Republic</option>' +
            '<option value="HU">Hungary</option>' +
            '<option value="SK">Slovakia</option>' +
            '<option value="SI">Slovenia</option>' +
            '<option value="HR">Croatia</option>' +
            '<option value="RS">Serbia</option>' +
            '<option value="BG">Bulgaria</option>' +
            '<option value="RO">Romania</option>' +
            '<option value="GR">Greece</option>' +
            '<option value="PT">Portugal</option>' +
            '<option value="IE">Ireland</option>' +
            '<option value="IS">Iceland</option>' +
            '<option value="LU">Luxembourg</option>' +
            '<option value="LI">Liechtenstein</option>' +
            '<option value="MC">Monaco</option>' +
            '<option value="AD">Andorra</option>' +
            '<option value="SM">San Marino</option>' +
            '<option value="VA">Vatican City</option>' +
            '<option value="MT">Malta</option>' +
            '<option value="CY">Cyprus</option>' +
            '<option value="TR">Turkey</option>' +
            '<option value="RU">Russia</option>' +
            '<option value="UA">Ukraine</option>' +
            '<option value="BY">Belarus</option>' +
            '<option value="LT">Lithuania</option>' +
            '<option value="LV">Latvia</option>' +
            '<option value="EE">Estonia</option>' +
            '<option value="MD">Moldova</option>' +
            '<option value="GE">Georgia</option>' +
            '<option value="AM">Armenia</option>' +
            '<option value="AZ">Azerbaijan</option>' +
            '<option value="KZ">Kazakhstan</option>' +
            '<option value="UZ">Uzbekistan</option>' +
            '<option value="KG">Kyrgyzstan</option>' +
            '<option value="TJ">Tajikistan</option>' +
            '<option value="TM">Turkmenistan</option>' +
            '<option value="AF">Afghanistan</option>' +
            '<option value="PK">Pakistan</option>' +
            '<option value="IN">India</option>' +
            '<option value="BD">Bangladesh</option>' +
            '<option value="LK">Sri Lanka</option>' +
            '<option value="NP">Nepal</option>' +
            '<option value="BT">Bhutan</option>' +
            '<option value="MV">Maldives</option>' +
            '<option value="MM">Myanmar</option>' +
            '<option value="TH">Thailand</option>' +
            '<option value="LA">Laos</option>' +
            '<option value="KH">Cambodia</option>' +
            '<option value="VN">Vietnam</option>' +
            '<option value="MY">Malaysia</option>' +
            '<option value="SG">Singapore</option>' +
            '<option value="ID">Indonesia</option>' +
            '<option value="PH">Philippines</option>' +
            '<option value="BN">Brunei</option>' +
            '<option value="TL">East Timor</option>' +
            '<button type="button" class="button remove-address" style="margin-top: 5px;">Remove Address</button>' +
            '</div>');
        
        container.append(newAddress);
        addressIndex++;
        updateSchemaPreview();
    });

    $(document).on('click', '.remove-address', function() {
        $(this).closest('.address-item').remove();
        reindexAddresses();
        updateSchemaPreview();
    });

    // Reindex organization addresses to ensure sequential naming
    function reindexAddresses() {
        var totalAddresses = $('#org-addresses-container .address-item').length;
        $('#org-addresses-container .address-item').each(function(index) {
            // Update label - only show number if there are multiple addresses
            var labelText = totalAddresses > 1 ? 'Address ' + (index + 1) : 'Address';
            $(this).find('h5').text(labelText);
            
            // Update field names
            $(this).find('select[name*="[@type]"]').attr('name', 'schema_data[Organization][address][' + index + '][@type]');
            $(this).find('input[name*="[streetAddress]"]').attr('name', 'schema_data[Organization][address][' + index + '][streetAddress]');
            $(this).find('input[name*="[addressLocality]"]').attr('name', 'schema_data[Organization][address][' + index + '][addressLocality]');
            $(this).find('input[name*="[addressRegion]"]').attr('name', 'schema_data[Organization][address][' + index + '][addressRegion]');
            $(this).find('input[name*="[postalCode]"]').attr('name', 'schema_data[Organization][address][' + index + '][postalCode]');
            $(this).find('select[name*="[addressCountry]"]').attr('name', 'schema_data[Organization][address][' + index + '][addressCountry]');
        });
        // Update addressIndex to be one more than the highest index
        addressIndex = $('#org-addresses-container .address-item').length;
    }

    // Person address functionality
    $(document).on('click', '.add-person-address', function() {
        var container = $('#person-address-container');
        var newAddress = $('<div class="address-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 3px; background: #f9f9f9;">' +
            '<h5 style="margin: 0 0 10px 0; color: #23282d;">Address</h5>' +
            '<select name="schema_data[Person][address][@type]" class="regular-text" style="width: 100%; margin-bottom: 10px;">' +
            '<option value="PostalAddress" selected>Postal Address</option>' +
            '<option value="Place">Place</option>' +
            '</select>' +
            '<input type="text" name="schema_data[Person][address][streetAddress]" placeholder="Street Address" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<input type="text" name="schema_data[Person][address][addressLocality]" placeholder="City" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<input type="text" name="schema_data[Person][address][addressRegion]" placeholder="State/Region" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<input type="text" name="schema_data[Person][address][postalCode]" placeholder="Postal Code" class="regular-text" style="width: 100%; margin-bottom: 5px;" />' +
            '<select name="schema_data[Person][address][addressCountry]" class="regular-text" style="width: 100%; margin-bottom: 10px;">' +
            '<option value="">-- Select Country --</option>' +
            '<option value="US">United States</option>' +
            '<option value="GB">United Kingdom</option>' +
            '<option value="CA">Canada</option>' +
            '<option value="AU">Australia</option>' +
            '<option value="DE">Germany</option>' +
            '<option value="FR">France</option>' +
            '<option value="IT">Italy</option>' +
            '<option value="ES">Spain</option>' +
            '<option value="NL">Netherlands</option>' +
            '<option value="BE">Belgium</option>' +
            '<option value="CH">Switzerland</option>' +
            '<option value="AT">Austria</option>' +
            '<option value="SE">Sweden</option>' +
            '<option value="NO">Norway</option>' +
            '<option value="DK">Denmark</option>' +
            '<option value="FI">Finland</option>' +
            '<option value="PL">Poland</option>' +
            '<option value="CZ">Czech Republic</option>' +
            '<option value="HU">Hungary</option>' +
            '<option value="SK">Slovakia</option>' +
            '<option value="SI">Slovenia</option>' +
            '<option value="HR">Croatia</option>' +
            '<option value="RS">Serbia</option>' +
            '<option value="BG">Bulgaria</option>' +
            '<option value="RO">Romania</option>' +
            '<option value="GR">Greece</option>' +
            '<option value="PT">Portugal</option>' +
            '<option value="IE">Ireland</option>' +
            '<option value="IS">Iceland</option>' +
            '<option value="LU">Luxembourg</option>' +
            '<option value="LI">Liechtenstein</option>' +
            '<option value="MC">Monaco</option>' +
            '<option value="AD">Andorra</option>' +
            '<option value="SM">San Marino</option>' +
            '<option value="VA">Vatican City</option>' +
            '<option value="MT">Malta</option>' +
            '<option value="CY">Cyprus</option>' +
            '<option value="TR">Turkey</option>' +
            '<option value="RU">Russia</option>' +
            '<option value="UA">Ukraine</option>' +
            '<option value="BY">Belarus</option>' +
            '<option value="LT">Lithuania</option>' +
            '<option value="LV">Latvia</option>' +
            '<option value="EE">Estonia</option>' +
            '<option value="MD">Moldova</option>' +
            '<option value="GE">Georgia</option>' +
            '<option value="AM">Armenia</option>' +
            '<option value="AZ">Azerbaijan</option>' +
            '<option value="KZ">Kazakhstan</option>' +
            '<option value="UZ">Uzbekistan</option>' +
            '<option value="KG">Kyrgyzstan</option>' +
            '<option value="TJ">Tajikistan</option>' +
            '<option value="TM">Turkmenistan</option>' +
            '<option value="AF">Afghanistan</option>' +
            '<option value="PK">Pakistan</option>' +
            '<option value="IN">India</option>' +
            '<option value="BD">Bangladesh</option>' +
            '<option value="LK">Sri Lanka</option>' +
            '<option value="NP">Nepal</option>' +
            '<option value="BT">Bhutan</option>' +
            '<option value="MV">Maldives</option>' +
            '<option value="MM">Myanmar</option>' +
            '<option value="TH">Thailand</option>' +
            '<option value="LA">Laos</option>' +
            '<option value="KH">Cambodia</option>' +
            '<option value="VN">Vietnam</option>' +
            '<option value="MY">Malaysia</option>' +
            '<option value="SG">Singapore</option>' +
            '<option value="ID">Indonesia</option>' +
            '<option value="PH">Philippines</option>' +
            '<option value="BN">Brunei</option>' +
            '<option value="TL">East Timor</option>' +
            '<button type="button" class="button remove-person-address" style="margin-top: 5px;">Remove Address</button>' +
            '</div>');
        
        container.html(newAddress);
        updateSchemaPreview();
    });

    $(document).on('click', '.remove-person-address', function() {
        var container = $('#person-address-container');
        container.html('<button type="button" class="button add-person-address">+ Add Address</button>' +
            '<p class="description">Optional: Add a postal address for this person.</p>');
        updateSchemaPreview();
    });

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Service area repeater functionality
    var areaIndex = 0;
    
    // Initialize areaIndex based on existing areas
    function initializeAreaIndex() {
        var existingAreas = $('#service-areas-container .service-area-item').length;
        areaIndex = existingAreas;
    }
    
    // Call on page load
    initializeAreaIndex();
    
    $('.add-area').on('click', function() {
        var container = $('#service-areas-container');
        var newArea = $('<div class="service-area-item" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 3px; background: #f9f9f9;">' +
            '<select name="schema_data[Service][areaServed][' + areaIndex + '][@type]" class="area-type-select" style="width: 120px; margin-right: 10px;">' +
            '<option value="Country">Country</option>' +
            '<option value="State">State/Province</option>' +
            '<option value="City">City</option>' +
            '<option value="AdministrativeArea">Administrative Area</option>' +
            '</select>' +
            '<select name="schema_data[Service][areaServed][' + areaIndex + '][name]" class="regular-text" style="width: 250px;">' +
            '<option value="">-- Select Country --</option>' +
            '<option value="US">United States</option>' +
            '<option value="GB">United Kingdom</option>' +
            '<option value="CA">Canada</option>' +
            '<option value="AU">Australia</option>' +
            '<option value="DE">Germany</option>' +
            '<option value="FR">France</option>' +
            '<option value="IT">Italy</option>' +
            '<option value="ES">Spain</option>' +
            '<option value="NL">Netherlands</option>' +
            '<option value="BE">Belgium</option>' +
            '<option value="CH">Switzerland</option>' +
            '<option value="AT">Austria</option>' +
            '<option value="SE">Sweden</option>' +
            '<option value="NO">Norway</option>' +
            '<option value="DK">Denmark</option>' +
            '<option value="FI">Finland</option>' +
            '<option value="PL">Poland</option>' +
            '<option value="CZ">Czech Republic</option>' +
            '<option value="HU">Hungary</option>' +
            '<option value="SK">Slovakia</option>' +
            '<option value="SI">Slovenia</option>' +
            '<option value="HR">Croatia</option>' +
            '<option value="RS">Serbia</option>' +
            '<option value="BG">Bulgaria</option>' +
            '<option value="RO">Romania</option>' +
            '<option value="GR">Greece</option>' +
            '<option value="PT">Portugal</option>' +
            '<option value="IE">Ireland</option>' +
            '<option value="IS">Iceland</option>' +
            '<option value="LU">Luxembourg</option>' +
            '<option value="LI">Liechtenstein</option>' +
            '<option value="MC">Monaco</option>' +
            '<option value="AD">Andorra</option>' +
            '<option value="SM">San Marino</option>' +
            '<option value="VA">Vatican City</option>' +
            '<option value="MT">Malta</option>' +
            '<option value="CY">Cyprus</option>' +
            '<option value="TR">Turkey</option>' +
            '<option value="RU">Russia</option>' +
            '<option value="UA">Ukraine</option>' +
            '<option value="BY">Belarus</option>' +
            '<option value="LT">Lithuania</option>' +
            '<option value="LV">Latvia</option>' +
            '<option value="EE">Estonia</option>' +
            '<option value="MD">Moldova</option>' +
            '<option value="GE">Georgia</option>' +
            '<option value="AM">Armenia</option>' +
            '<option value="AZ">Azerbaijan</option>' +
            '<option value="KZ">Kazakhstan</option>' +
            '<option value="UZ">Uzbekistan</option>' +
            '<option value="KG">Kyrgyzstan</option>' +
            '<option value="TJ">Tajikistan</option>' +
            '<option value="TM">Turkmenistan</option>' +
            '<option value="AF">Afghanistan</option>' +
            '<option value="PK">Pakistan</option>' +
            '<option value="IN">India</option>' +
            '<option value="BD">Bangladesh</option>' +
            '<option value="LK">Sri Lanka</option>' +
            '<option value="NP">Nepal</option>' +
            '<option value="BT">Bhutan</option>' +
            '<option value="MV">Maldives</option>' +
            '<option value="MM">Myanmar</option>' +
            '<option value="TH">Thailand</option>' +
            '<option value="LA">Laos</option>' +
            '<option value="KH">Cambodia</option>' +
            '<option value="VN">Vietnam</option>' +
            '<option value="MY">Malaysia</option>' +
            '<option value="SG">Singapore</option>' +
            '<option value="ID">Indonesia</option>' +
            '<option value="PH">Philippines</option>' +
            '<option value="BN">Brunei</option>' +
            '<option value="TL">East Timor</option>' +
            '<button type="button" class="button remove-area" style="margin-left: 10px;">Remove</button>' +
            '</div>');
        
        container.append(newArea);
        areaIndex++;
        updateSchemaPreview();
    });

    $(document).on('click', '.remove-area', function() {
        $(this).closest('.service-area-item').remove();
        reindexServiceAreas();
        updateSchemaPreview();
    });

    // Reindex service areas to ensure sequential naming
    function reindexServiceAreas() {
        $('#service-areas-container .service-area-item').each(function(index) {
            $(this).find('select[name*="[@type]"]').attr('name', 'schema_data[Service][areaServed][' + index + '][@type]');
            $(this).find('input[name*="[name]"], select[name*="[name]"]').attr('name', 'schema_data[Service][areaServed][' + index + '][name]');
        });
        // Update areaIndex to be one more than the highest index
        areaIndex = $('#service-areas-container .service-area-item').length;
    }

    // Dynamic switching for service area input fields
    $(document).on('change', '.area-type-select', function() {
        var $areaItem = $(this).closest('.service-area-item');
        var selectedType = $(this).val();
        var $nameField = $areaItem.find('select[name*="[name]"], input[name*="[name]"]');
        
        if (selectedType === 'Country') {
            // Replace with country dropdown
            var $newField = $('<select name="' + $nameField.attr('name') + '" class="regular-text" style="width: 250px;">' +
                '<option value="">-- Select Country --</option>' +
                '<option value="US">United States</option>' +
                '<option value="GB">United Kingdom</option>' +
                '<option value="CA">Canada</option>' +
                '<option value="AU">Australia</option>' +
                '<option value="DE">Germany</option>' +
                '<option value="FR">France</option>' +
                '<option value="IT">Italy</option>' +
                '<option value="ES">Spain</option>' +
                '<option value="NL">Netherlands</option>' +
                '<option value="BE">Belgium</option>' +
                '<option value="CH">Switzerland</option>' +
                '<option value="AT">Austria</option>' +
                '<option value="SE">Sweden</option>' +
                '<option value="NO">Norway</option>' +
                '<option value="DK">Denmark</option>' +
                '<option value="FI">Finland</option>' +
                '<option value="PL">Poland</option>' +
                '<option value="CZ">Czech Republic</option>' +
                '<option value="HU">Hungary</option>' +
                '<option value="SK">Slovakia</option>' +
                '<option value="SI">Slovenia</option>' +
                '<option value="HR">Croatia</option>' +
                '<option value="RS">Serbia</option>' +
                '<option value="BG">Bulgaria</option>' +
                '<option value="RO">Romania</option>' +
                '<option value="GR">Greece</option>' +
                '<option value="PT">Portugal</option>' +
                '<option value="IE">Ireland</option>' +
                '<option value="IS">Iceland</option>' +
                '<option value="LU">Luxembourg</option>' +
                '<option value="LI">Liechtenstein</option>' +
                '<option value="MC">Monaco</option>' +
                '<option value="AD">Andorra</option>' +
                '<option value="SM">San Marino</option>' +
                '<option value="VA">Vatican City</option>' +
                '<option value="MT">Malta</option>' +
                '<option value="CY">Cyprus</option>' +
                '<option value="TR">Turkey</option>' +
                '<option value="RU">Russia</option>' +
                '<option value="UA">Ukraine</option>' +
                '<option value="BY">Belarus</option>' +
                '<option value="LT">Lithuania</option>' +
                '<option value="LV">Latvia</option>' +
                '<option value="EE">Estonia</option>' +
                '<option value="MD">Moldova</option>' +
                '<option value="GE">Georgia</option>' +
                '<option value="AM">Armenia</option>' +
                '<option value="AZ">Azerbaijan</option>' +
                '<option value="KZ">Kazakhstan</option>' +
                '<option value="UZ">Uzbekistan</option>' +
                '<option value="KG">Kyrgyzstan</option>' +
                '<option value="TJ">Tajikistan</option>' +
                '<option value="TM">Turkmenistan</option>' +
                '<option value="AF">Afghanistan</option>' +
                '<option value="PK">Pakistan</option>' +
                '<option value="IN">India</option>' +
                '<option value="BD">Bangladesh</option>' +
                '<option value="LK">Sri Lanka</option>' +
                '<option value="NP">Nepal</option>' +
                '<option value="BT">Bhutan</option>' +
                '<option value="MV">Maldives</option>' +
                '<option value="MM">Myanmar</option>' +
                '<option value="TH">Thailand</option>' +
                '<option value="LA">Laos</option>' +
                '<option value="KH">Cambodia</option>' +
                '<option value="VN">Vietnam</option>' +
                '<option value="MY">Malaysia</option>' +
                '<option value="SG">Singapore</option>' +
                '<option value="ID">Indonesia</option>' +
                '<option value="PH">Philippines</option>' +
                '<option value="BN">Brunei</option>' +
                '<option value="TL">East Timor</option>' +
                '</select>');
            $nameField.replaceWith($newField);
        } else {
            // Replace with text input
            var $newField = $('<input type="text" name="' + $nameField.attr('name') + '" placeholder="Location Name (e.g., California, London)" class="regular-text area-name-input" style="width: 250px;" />');
            $nameField.replaceWith($newField);
        }
        
        updateSchemaPreview();
    });
});
