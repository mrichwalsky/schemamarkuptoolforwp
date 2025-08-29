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

        // Build the final schema JSON
        var finalSchema = {
            '@context': 'https://schema.org',
            '@type': selectedType
        };

        if (schemaData[selectedType] && Object.keys(schemaData[selectedType]).length > 0) {
            finalSchema = { ...finalSchema, ...schemaData[selectedType] };
        }

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

    // Add some helpful tooltips and validation
    $('.schema-form input[type="url"]').on('blur', function() {
        var value = $(this).val();
        if (value && !isValidUrl(value)) {
            $(this).addClass('error');
            if (!$(this).next('.error-message').length) {
                $(this).after('<span class="error-message" style="color: red; font-size: 12px;">Please enter a valid URL</span>');
            }
        } else {
            $(this).removeClass('error');
            $(this).next('.error-message').remove();
        }
    });

    $('.schema-form input[type="email"]').on('blur', function() {
        var value = $(this).val();
        if (value && !isValidEmail(value)) {
            $(this).addClass('error');
            if (!$(this).next('.error-message').length) {
                $(this).after('<span class="error-message" style="color: red; font-size: 12px;">Please enter a valid email address</span>');
            }
        } else {
            $(this).removeClass('error');
            $(this).next('.error-message').remove();
        }
    });

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
            '<option value="EE">Estonia</option>' +
            '<option value="LV">Latvia</option>' +
            '<option value="LT">Lithuania</option>' +
            '<option value="JP">Japan</option>' +
            '<option value="KR">South Korea</option>' +
            '<option value="CN">China</option>' +
            '<option value="IN">India</option>' +
            '<option value="BR">Brazil</option>' +
            '<option value="AR">Argentina</option>' +
            '<option value="CL">Chile</option>' +
            '<option value="MX">Mexico</option>' +
            '<option value="NZ">New Zealand</option>' +
            '<option value="ZA">South Africa</option>' +
            '<option value="EG">Egypt</option>' +
            '<option value="MA">Morocco</option>' +
            '<option value="TN">Tunisia</option>' +
            '<option value="DZ">Algeria</option>' +
            '<option value="LY">Libya</option>' +
            '<option value="SD">Sudan</option>' +
            '<option value="ET">Ethiopia</option>' +
            '<option value="KE">Kenya</option>' +
            '<option value="UG">Uganda</option>' +
            '<option value="TZ">Tanzania</option>' +
            '<option value="ZM">Zambia</option>' +
            '<option value="ZW">Zimbabwe</option>' +
            '<option value="BW">Botswana</option>' +
            '<option value="NA">Namibia</option>' +
            '<option value="AO">Angola</option>' +
            '<option value="MZ">Mozambique</option>' +
            '<option value="MG">Madagascar</option>' +
            '<option value="MU">Mauritius</option>' +
            '<option value="SC">Seychelles</option>' +
            '<option value="KM">Comoros</option>' +
            '<option value="DJ">Djibouti</option>' +
            '<option value="SO">Somalia</option>' +
            '<option value="ER">Eritrea</option>' +
            '</select>' +
            '<button type="button" class="button remove-address" style="margin-top: 5px;">Remove Address</button>' +
            '</div>');
        
        container.append(newAddress);
        addressIndex++;
        updateSchemaPreview();
    });

    // Remove organization address
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
    
    // We'll get country data from PHP via AJAX or include it directly
    // For now, we'll use a simplified approach
    
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
            '<option value="EE">Estonia</option>' +
            '<option value="LV">Latvia</option>' +
            '<option value="LT">Lithuania</option>' +
            '<option value="JP">Japan</option>' +
            '<option value="KR">South Korea</option>' +
            '<option value="CN">China</option>' +
            '<option value="IN">India</option>' +
            '<option value="BR">Brazil</option>' +
            '<option value="AR">Argentina</option>' +
            '<option value="CL">Chile</option>' +
            '<option value="MX">Mexico</option>' +
            '<option value="NZ">New Zealand</option>' +
            '<option value="ZA">South Africa</option>' +
            '<option value="EG">Egypt</option>' +
            '<option value="MA">Morocco</option>' +
            '<option value="TN">Tunisia</option>' +
            '<option value="DZ">Algeria</option>' +
            '<option value="LY">Libya</option>' +
            '<option value="SD">Sudan</option>' +
            '<option value="ET">Ethiopia</option>' +
            '<option value="KE">Kenya</option>' +
            '<option value="UG">Uganda</option>' +
            '<option value="TZ">Tanzania</option>' +
            '<option value="ZM">Zambia</option>' +
            '<option value="ZW">Zimbabwe</option>' +
            '<option value="BW">Botswana</option>' +
            '<option value="NA">Namibia</option>' +
            '<option value="AO">Angola</option>' +
            '<option value="MZ">Mozambique</option>' +
            '<option value="MG">Madagascar</option>' +
            '<option value="MU">Mauritius</option>' +
            '<option value="SC">Seychelles</option>' +
            '<option value="KM">Comoros</option>' +
            '<option value="DJ">Djibouti</option>' +
            '<option value="SO">Somalia</option>' +
            '<option value="ER">Eritrea</option>' +
            '</select>' +
            '<button type="button" class="button remove-area" style="margin-left: 10px;">Remove</button>' +
            '</div>');
        
        container.append(newArea);
        areaIndex++;
        updateSchemaPreview();
    });

    // Remove service area (delegate to handle dynamically added elements)
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

    // For now, we'll keep it simple and let users type country codes directly
    // The PHP side will handle validation and display names
    
    // Handle area type changes to show/hide country dropdown
    $(document).on('change', '.area-type-select', function() {
        var $areaItem = $(this).closest('.service-area-item');
        var $nameField = $areaItem.find('input[name*="[name]"], select[name*="[name]"]');
        var selectedType = $(this).val();
        
        if (selectedType === 'Country') {
            // Replace with country dropdown if not already a dropdown
            if (!$nameField.is('select')) {
                var currentValue = $nameField.val();
                var countrySelect = '<select name="' + $nameField.attr('name') + '" class="regular-text" style="width: 250px;">';
                countrySelect += '<option value="">-- Select Country --</option>';
                countrySelect += '<option value="US">United States</option>';
                countrySelect += '<option value="GB">United Kingdom</option>';
                countrySelect += '<option value="CA">Canada</option>';
                countrySelect += '<option value="AU">Australia</option>';
                countrySelect += '<option value="DE">Germany</option>';
                countrySelect += '<option value="FR">France</option>';
                countrySelect += '<option value="IT">Italy</option>';
                countrySelect += '<option value="ES">Spain</option>';
                countrySelect += '<option value="NL">Netherlands</option>';
                countrySelect += '<option value="BE">Belgium</option>';
                countrySelect += '<option value="CH">Switzerland</option>';
                countrySelect += '<option value="AT">Austria</option>';
                countrySelect += '<option value="SE">Sweden</option>';
                countrySelect += '<option value="NO">Norway</option>';
                countrySelect += '<option value="DK">Denmark</option>';
                countrySelect += '<option value="FI">Finland</option>';
                countrySelect += '<option value="PL">Poland</option>';
                countrySelect += '<option value="CZ">Czech Republic</option>';
                countrySelect += '<option value="HU">Hungary</option>';
                countrySelect += '<option value="SK">Slovakia</option>';
                countrySelect += '<option value="SI">Slovenia</option>';
                countrySelect += '<option value="HR">Croatia</option>';
                countrySelect += '<option value="RS">Serbia</option>';
                countrySelect += '<option value="BG">Bulgaria</option>';
                countrySelect += '<option value="RO">Romania</option>';
                countrySelect += '<option value="GR">Greece</option>';
                countrySelect += '<option value="PT">Portugal</option>';
                countrySelect += '<option value="IE">Ireland</option>';
                countrySelect += '<option value="IS">Iceland</option>';
                countrySelect += '<option value="LU">Luxembourg</option>';
                countrySelect += '<option value="LI">Liechtenstein</option>';
                countrySelect += '<option value="MC">Monaco</option>';
                countrySelect += '<option value="AD">Andorra</option>';
                countrySelect += '<option value="SM">San Marino</option>';
                countrySelect += '<option value="VA">Vatican City</option>';
                countrySelect += '<option value="MT">Malta</option>';
                countrySelect += '<option value="CY">Cyprus</option>';
                countrySelect += '<option value="EE">Estonia</option>';
                countrySelect += '<option value="LV">Latvia</option>';
                countrySelect += '<option value="LT">Lithuania</option>';
                countrySelect += '<option value="JP">Japan</option>';
                countrySelect += '<option value="KR">South Korea</option>';
                countrySelect += '<option value="CN">China</option>';
                countrySelect += '<option value="IN">India</option>';
                countrySelect += '<option value="BR">Brazil</option>';
                countrySelect += '<option value="AR">Argentina</option>';
                countrySelect += '<option value="CL">Chile</option>';
                countrySelect += '<option value="MX">Mexico</option>';
                countrySelect += '<option value="NZ">New Zealand</option>';
                countrySelect += '<option value="ZA">South Africa</option>';
                countrySelect += '<option value="EG">Egypt</option>';
                countrySelect += '<option value="MA">Morocco</option>';
                countrySelect += '<option value="TN">Tunisia</option>';
                countrySelect += '<option value="DZ">Algeria</option>';
                countrySelect += '<option value="LY">Libya</option>';
                countrySelect += '<option value="SD">Sudan</option>';
                countrySelect += '<option value="ET">Ethiopia</option>';
                countrySelect += '<option value="KE">Kenya</option>';
                countrySelect += '<option value="UG">Uganda</option>';
                countrySelect += '<option value="TZ">Tanzania</option>';
                countrySelect += '<option value="ZM">Zambia</option>';
                countrySelect += '<option value="ZW">Zimbabwe</option>';
                countrySelect += '<option value="BW">Botswana</option>';
                countrySelect += '<option value="NA">Namibia</option>';
                countrySelect += '<option value="AO">Angola</option>';
                countrySelect += '<option value="MZ">Mozambique</option>';
                countrySelect += '<option value="MG">Madagascar</option>';
                countrySelect += '<option value="MU">Mauritius</option>';
                countrySelect += '<option value="SC">Seychelles</option>';
                countrySelect += '<option value="KM">Comoros</option>';
                countrySelect += '<option value="DJ">Djibouti</option>';
                countrySelect += '<option value="SO">Somalia</option>';
                countrySelect += '<option value="ER">Eritrea</option>';
                countrySelect += '<option value="CF">Central African Republic</option>';
                countrySelect += '<option value="TD">Chad</option>';
                countrySelect += '<option value="NE">Niger</option>';
                countrySelect += '<option value="ML">Mali</option>';
                countrySelect += '<option value="BF">Burkina Faso</option>';
                countrySelect += '<option value="SN">Senegal</option>';
                countrySelect += '<option value="GM">Gambia</option>';
                countrySelect += '<option value="GW">Guinea-Bissau</option>';
                countrySelect += '<option value="GN">Guinea</option>';
                countrySelect += '<option value="SL">Sierra Leone</option>';
                countrySelect += '<option value="LR">Liberia</option>';
                countrySelect += '<option value="CI">Ivory Coast</option>';
                countrySelect += '<option value="GH">Ghana</option>';
                countrySelect += '<option value="TG">Togo</option>';
                countrySelect += '<option value="BJ">Benin</option>';
                countrySelect += '<option value="NG">Nigeria</option>';
                countrySelect += '<option value="CM">Cameroon</option>';
                countrySelect += '<option value="GA">Gabon</option>';
                countrySelect += '<option value="CG">Republic of the Congo</option>';
                countrySelect += '<option value="CD">Democratic Republic of the Congo</option>';
                countrySelect += '<option value="RW">Rwanda</option>';
                countrySelect += '<option value="BI">Burundi</option>';
                countrySelect += '<option value="MW">Malawi</option>';
                countrySelect += '<option value="LS">Lesotho</option>';
                countrySelect += '<option value="SZ">Eswatini</option>';
                countrySelect += '<option value="TH">Thailand</option>';
                countrySelect += '<option value="VN">Vietnam</option>';
                countrySelect += '<option value="KH">Cambodia</option>';
                countrySelect += '<option value="LA">Laos</option>';
                countrySelect += '<option value="MM">Myanmar</option>';
                countrySelect += '<option value="BD">Bangladesh</option>';
                countrySelect += '<option value="LK">Sri Lanka</option>';
                countrySelect += '<option value="NP">Nepal</option>';
                countrySelect += '<option value="BT">Bhutan</option>';
                countrySelect += '<option value="MV">Maldives</option>';
                countrySelect += '<option value="PK">Pakistan</option>';
                countrySelect += '<option value="AF">Afghanistan</option>';
                countrySelect += '<option value="IR">Iran</option>';
                countrySelect += '<option value="IQ">Iraq</option>';
                countrySelect += '<option value="SY">Syria</option>';
                countrySelect += '<option value="LB">Lebanon</option>';
                countrySelect += '<option value="JO">Jordan</option>';
                countrySelect += '<option value="IL">Israel</option>';
                countrySelect += '<option value="PS">Palestine</option>';
                countrySelect += '<option value="SA">Saudi Arabia</option>';
                countrySelect += '<option value="YE">Yemen</option>';
                countrySelect += '<option value="OM">Oman</option>';
                countrySelect += '<option value="AE">United Arab Emirates</option>';
                countrySelect += '<option value="QA">Qatar</option>';
                countrySelect += '<option value="BH">Bahrain</option>';
                countrySelect += '<option value="KW">Kuwait</option>';
                countrySelect += '<option value="TR">Turkey</option>';
                countrySelect += '<option value="GE">Georgia</option>';
                countrySelect += '<option value="AM">Armenia</option>';
                countrySelect += '<option value="AZ">Azerbaijan</option>';
                countrySelect += '<option value="KZ">Kazakhstan</option>';
                countrySelect += '<option value="UZ">Uzbekistan</option>';
                countrySelect += '<option value="TM">Turkmenistan</option>';
                countrySelect += '<option value="KG">Kyrgyzstan</option>';
                countrySelect += '<option value="TJ">Tajikistan</option>';
                countrySelect += '<option value="MN">Mongolia</option>';
                countrySelect += '<option value="KP">North Korea</option>';
                countrySelect += '<option value="TW">Taiwan</option>';
                countrySelect += '<option value="HK">Hong Kong</option>';
                countrySelect += '<option value="MO">Macau</option>';
                countrySelect += '<option value="SG">Singapore</option>';
                countrySelect += '<option value="MY">Malaysia</option>';
                countrySelect += '<option value="ID">Indonesia</option>';
                countrySelect += '<option value="PH">Philippines</option>';
                countrySelect += '<option value="BN">Brunei</option>';
                countrySelect += '<option value="TL">East Timor</option>';
                countrySelect += '<option value="PG">Papua New Guinea</option>';
                countrySelect += '<option value="FJ">Fiji</option>';
                countrySelect += '<option value="VU">Vanuatu</option>';
                countrySelect += '<option value="SB">Solomon Islands</option>';
                countrySelect += '<option value="NC">New Caledonia</option>';
                countrySelect += '<option value="PF">French Polynesia</option>';
                countrySelect += '<option value="WS">Samoa</option>';
                countrySelect += '<option value="TO">Tonga</option>';
                countrySelect += '<option value="KI">Kiribati</option>';
                countrySelect += '<option value="TV">Tuvalu</option>';
                countrySelect += '<option value="NR">Nauru</option>';
                countrySelect += '<option value="PW">Palau</option>';
                countrySelect += '<option value="MH">Marshall Islands</option>';
                countrySelect += '<option value="FM">Micronesia</option>';
                countrySelect += '<option value="MP">Northern Mariana Islands</option>';
                countrySelect += '<option value="GU">Guam</option>';
                countrySelect += '<option value="AS">American Samoa</option>';
                countrySelect += '<option value="PR">Puerto Rico</option>';
                countrySelect += '<option value="VI">U.S. Virgin Islands</option>';
                countrySelect += '<option value="VG">British Virgin Islands</option>';
                countrySelect += '<option value="AI">Anguilla</option>';
                countrySelect += '<option value="MS">Montserrat</option>';
                countrySelect += '<option value="KN">Saint Kitts and Nevis</option>';
                countrySelect += '<option value="AG">Antigua and Barbuda</option>';
                countrySelect += '<option value="DM">Dominica</option>';
                countrySelect += '<option value="LC">Saint Lucia</option>';
                countrySelect += '<option value="VC">Saint Vincent and the Grenadines</option>';
                countrySelect += '<option value="BB">Barbados</option>';
                countrySelect += '<option value="GD">Grenada</option>';
                countrySelect += '<option value="TT">Trinidad and Tobago</option>';
                countrySelect += '<option value="JM">Jamaica</option>';
                countrySelect += '<option value="HT">Haiti</option>';
                countrySelect += '<option value="DO">Dominican Republic</option>';
                countrySelect += '<option value="CU">Cuba</option>';
                countrySelect += '<option value="BS">Bahamas</option>';
                countrySelect += '<option value="BZ">Belize</option>';
                countrySelect += '<option value="GT">Guatemala</option>';
                countrySelect += '<option value="SV">El Salvador</option>';
                countrySelect += '<option value="HN">Honduras</option>';
                countrySelect += '<option value="NI">Nicaragua</option>';
                countrySelect += '<option value="CR">Costa Rica</option>';
                countrySelect += '<option value="PA">Panama</option>';
                countrySelect += '<option value="CO">Colombia</option>';
                countrySelect += '<option value="VE">Venezuela</option>';
                countrySelect += '<option value="GY">Guyana</option>';
                countrySelect += '<option value="SR">Suriname</option>';
                countrySelect += '<option value="GF">French Guiana</option>';
                countrySelect += '<option value="EC">Ecuador</option>';
                countrySelect += '<option value="PE">Peru</option>';
                countrySelect += '<option value="BO">Bolivia</option>';
                countrySelect += '<option value="PY">Paraguay</option>';
                countrySelect += '<option value="UY">Uruguay</option>';
                countrySelect += '<option value="FK">Falkland Islands</option>';
                countrySelect += '<option value="GS">South Georgia and the South Sandwich Islands</option>';
                countrySelect += '<option value="BV">Bouvet Island</option>';
                countrySelect += '<option value="HM">Heard Island and McDonald Islands</option>';
                countrySelect += '<option value="TF">French Southern Territories</option>';
                countrySelect += '<option value="IO">British Indian Ocean Territory</option>';
                countrySelect += '<option value="CX">Christmas Island</option>';
                countrySelect += '<option value="CC">Cocos (Keeling) Islands</option>';
                countrySelect += '<option value="NF">Norfolk Island</option>';
                countrySelect += '<option value="PN">Pitcairn Islands</option>';
                countrySelect += '<option value="TK">Tokelau</option>';
                countrySelect += '<option value="NU">Niue</option>';
                countrySelect += '<option value="CK">Cook Islands</option>';
                countrySelect += '<option value="WF">Wallis and Futuna</option>';
                countrySelect += '<option value="PM">Saint Pierre and Miquelon</option>';
                countrySelect += '<option value="GL">Greenland</option>';
                countrySelect += '<option value="FO">Faroe Islands</option>';
                countrySelect += '<option value="SJ">Svalbard and Jan Mayen</option>';
                countrySelect += '</select>';
                
                // Set the current value if it exists
                if (currentValue) {
                    countrySelect = countrySelect.replace('value="">-- Select Country --</option>', 'value="">-- Select Country --</option>');
                    countrySelect = countrySelect.replace('value="' + currentValue + '">', 'value="' + currentValue + '" selected>');
                }
                
                $nameField.replaceWith(countrySelect);
            }
        } else {
            // Replace country dropdown with text input
            var $countrySelect = $areaItem.find('select[name*="[name]"]');
            if ($countrySelect.length) {
                var currentValue = $countrySelect.val();
                var textInput = '<input type="text" name="' + $countrySelect.attr('name') + '" value="' + currentValue + '" placeholder="Location Name (e.g., California, London)" class="regular-text area-name-input" style="width: 250px;" />';
                $countrySelect.replaceWith(textInput);
            }
        }
        
        updateSchemaPreview();
    });
});
