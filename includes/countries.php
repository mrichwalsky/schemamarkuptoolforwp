<?php
/**
 * Country data for GM8 Schema Manager
 * ISO 3166-1 alpha-2 country codes with display names
 */

if (!defined('ABSPATH')) exit;

class GM8_Countries {
    
    /**
     * Get all countries as an associative array
     * @return array Array with ISO codes as keys and display names as values
     */
    public static function get_all() {
        return [
            'US' => 'United States',
            'GB' => 'United Kingdom',
            'CA' => 'Canada',
            'AU' => 'Australia',
            'DE' => 'Germany',
            'FR' => 'France',
            'IT' => 'Italy',
            'ES' => 'Spain',
            'NL' => 'Netherlands',
            'BE' => 'Belgium',
            'CH' => 'Switzerland',
            'AT' => 'Austria',
            'SE' => 'Sweden',
            'NO' => 'Norway',
            'DK' => 'Denmark',
            'FI' => 'Finland',
            'PL' => 'Poland',
            'CZ' => 'Czech Republic',
            'HU' => 'Hungary',
            'SK' => 'Slovakia',
            'SI' => 'Slovenia',
            'HR' => 'Croatia',
            'RS' => 'Serbia',
            'BG' => 'Bulgaria',
            'RO' => 'Romania',
            'GR' => 'Greece',
            'PT' => 'Portugal',
            'IE' => 'Ireland',
            'IS' => 'Iceland',
            'LU' => 'Luxembourg',
            'LI' => 'Liechtenstein',
            'MC' => 'Monaco',
            'AD' => 'Andorra',
            'SM' => 'San Marino',
            'VA' => 'Vatican City',
            'MT' => 'Malta',
            'CY' => 'Cyprus',
            'EE' => 'Estonia',
            'LV' => 'Latvia',
            'LT' => 'Lithuania',
            'JP' => 'Japan',
            'KR' => 'South Korea',
            'CN' => 'China',
            'IN' => 'India',
            'BR' => 'Brazil',
            'AR' => 'Argentina',
            'CL' => 'Chile',
            'MX' => 'Mexico',
            'NZ' => 'New Zealand',
            'ZA' => 'South Africa',
            'EG' => 'Egypt',
            'MA' => 'Morocco',
            'TN' => 'Tunisia',
            'DZ' => 'Algeria',
            'LY' => 'Libya',
            'SD' => 'Sudan',
            'ET' => 'Ethiopia',
            'KE' => 'Kenya',
            'UG' => 'Uganda',
            'TZ' => 'Tanzania',
            'ZM' => 'Zambia',
            'ZW' => 'Zimbabwe',
            'BW' => 'Botswana',
            'NA' => 'Namibia',
            'AO' => 'Angola',
            'MZ' => 'Mozambique',
            'MG' => 'Madagascar',
            'MU' => 'Mauritius',
            'SC' => 'Seychelles',
            'KM' => 'Comoros',
            'DJ' => 'Djibouti',
            'SO' => 'Somalia',
            'ER' => 'Eritrea',
            'CF' => 'Central African Republic',
            'TD' => 'Chad',
            'NE' => 'Niger',
            'ML' => 'Mali',
            'BF' => 'Burkina Faso',
            'SN' => 'Senegal',
            'GM' => 'Gambia',
            'GW' => 'Guinea-Bissau',
            'GN' => 'Guinea',
            'SL' => 'Sierra Leone',
            'LR' => 'Liberia',
            'CI' => 'Ivory Coast',
            'GH' => 'Ghana',
            'TG' => 'Togo',
            'BJ' => 'Benin',
            'NG' => 'Nigeria',
            'CM' => 'Cameroon',
            'GA' => 'Gabon',
            'CG' => 'Republic of the Congo',
            'CD' => 'Democratic Republic of the Congo',
            'RW' => 'Rwanda',
            'BI' => 'Burundi',
            'MW' => 'Malawi',
            'LS' => 'Lesotho',
            'SZ' => 'Eswatini',
            'TH' => 'Thailand',
            'VN' => 'Vietnam',
            'KH' => 'Cambodia',
            'LA' => 'Laos',
            'MM' => 'Myanmar',
            'BD' => 'Bangladesh',
            'LK' => 'Sri Lanka',
            'NP' => 'Nepal',
            'BT' => 'Bhutan',
            'MV' => 'Maldives',
            'PK' => 'Pakistan',
            'AF' => 'Afghanistan',
            'IR' => 'Iran',
            'IQ' => 'Iraq',
            'SY' => 'Syria',
            'LB' => 'Lebanon',
            'JO' => 'Jordan',
            'IL' => 'Israel',
            'PS' => 'Palestine',
            'SA' => 'Saudi Arabia',
            'YE' => 'Yemen',
            'OM' => 'Oman',
            'AE' => 'United Arab Emirates',
            'QA' => 'Qatar',
            'BH' => 'Bahrain',
            'KW' => 'Kuwait',
            'TR' => 'Turkey',
            'GE' => 'Georgia',
            'AM' => 'Armenia',
            'AZ' => 'Azerbaijan',
            'KZ' => 'Kazakhstan',
            'UZ' => 'Uzbekistan',
            'TM' => 'Turkmenistan',
            'KG' => 'Kyrgyzstan',
            'TJ' => 'Tajikistan',
            'MN' => 'Mongolia',
            'KP' => 'North Korea',
            'TW' => 'Taiwan',
            'HK' => 'Hong Kong',
            'MO' => 'Macau',
            'SG' => 'Singapore',
            'MY' => 'Malaysia',
            'ID' => 'Indonesia',
            'PH' => 'Philippines',
            'BN' => 'Brunei',
            'TL' => 'East Timor',
            'PG' => 'Papua New Guinea',
            'FJ' => 'Fiji',
            'VU' => 'Vanuatu',
            'SB' => 'Solomon Islands',
            'NC' => 'New Caledonia',
            'PF' => 'French Polynesia',
            'WS' => 'Samoa',
            'TO' => 'Tonga',
            'KI' => 'Kiribati',
            'TV' => 'Tuvalu',
            'NR' => 'Nauru',
            'PW' => 'Palau',
            'MH' => 'Marshall Islands',
            'FM' => 'Micronesia',
            'MP' => 'Northern Mariana Islands',
            'GU' => 'Guam',
            'AS' => 'American Samoa',
            'PR' => 'Puerto Rico',
            'VI' => 'U.S. Virgin Islands',
            'VG' => 'British Virgin Islands',
            'AI' => 'Anguilla',
            'MS' => 'Montserrat',
            'KN' => 'Saint Kitts and Nevis',
            'AG' => 'Antigua and Barbuda',
            'DM' => 'Dominica',
            'LC' => 'Saint Lucia',
            'VC' => 'Saint Vincent and the Grenadines',
            'BB' => 'Barbados',
            'GD' => 'Grenada',
            'TT' => 'Trinidad and Tobago',
            'JM' => 'Jamaica',
            'HT' => 'Haiti',
            'DO' => 'Dominican Republic',
            'CU' => 'Cuba',
            'BS' => 'Bahamas',
            'BZ' => 'Belize',
            'GT' => 'Guatemala',
            'SV' => 'El Salvador',
            'HN' => 'Honduras',
            'NI' => 'Nicaragua',
            'CR' => 'Costa Rica',
            'PA' => 'Panama',
            'CO' => 'Colombia',
            'VE' => 'Venezuela',
            'GY' => 'Guyana',
            'SR' => 'Suriname',
            'GF' => 'French Guiana',
            'EC' => 'Ecuador',
            'PE' => 'Peru',
            'BO' => 'Bolivia',
            'PY' => 'Paraguay',
            'UY' => 'Uruguay',
            'FK' => 'Falkland Islands',
            'GS' => 'South Georgia and the South Sandwich Islands',
            'BV' => 'Bouvet Island',
            'HM' => 'Heard Island and McDonald Islands',
            'TF' => 'French Southern Territories',
            'IO' => 'British Indian Ocean Territory',
            'CX' => 'Christmas Island',
            'CC' => 'Cocos (Keeling) Islands',
            'NF' => 'Norfolk Island',
            'PN' => 'Pitcairn Islands',
            'TK' => 'Tokelau',
            'NU' => 'Niue',
            'CK' => 'Cook Islands',
            'WF' => 'Wallis and Futuna',
            'PM' => 'Saint Pierre and Miquelon',
            'GL' => 'Greenland',
            'FO' => 'Faroe Islands',
            'SJ' => 'Svalbard and Jan Mayen'
        ];
    }
    
    /**
     * Get country name by ISO code
     * @param string $iso_code The ISO 3166-1 alpha-2 code
     * @return string|false Country name or false if not found
     */
    public static function get_name($iso_code) {
        $countries = self::get_all();
        return isset($countries[$iso_code]) ? $countries[$iso_code] : false;
    }
    
    /**
     * Check if ISO code is valid
     * @param string $iso_code The ISO 3166-1 alpha-2 code
     * @return bool True if valid, false otherwise
     */
    public static function is_valid($iso_code) {
        $countries = self::get_all();
        return isset($countries[$iso_code]);
    }
    
    /**
     * Get countries as options for HTML select
     * @param string $selected_value Currently selected value
     * @return string HTML options
     */
    public static function get_select_options($selected_value = '') {
        $countries = self::get_all();
        $options = '<option value="">-- Select Country --</option>';
        
        foreach ($countries as $code => $name) {
            $selected = ($code === $selected_value) ? ' selected' : '';
            $options .= '<option value="' . esc_attr($code) . '"' . $selected . '>' . esc_html($name) . '</option>';
        }
        
        return $options;
    }
}
