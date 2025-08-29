<?php
/**
 * Plugin Name: GM8 Schema Manager
 * Description: Adds a meta box for schema data on posts, pages, and CPTs (like People), and injects JSON-LD schema into the front end.
 * Author: Gas Mark 8, Ltd.
 * Version: 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Include country data
require_once plugin_dir_path(__FILE__) . 'includes/countries.php';

class GM8_Schema_Manager {

    public function __construct() {
        add_action('add_meta_boxes', [$this, 'add_schema_metabox']);
        add_action('save_post', [$this, 'save_schema_data']);
        add_action('wp_head', [$this, 'inject_schema']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
    }

    public function enqueue_admin_scripts($hook) {
        if (in_array($hook, ['post.php', 'post-new.php'])) {
            wp_enqueue_script('gm8-schema-admin', plugin_dir_url(__FILE__) . 'js/admin.js', ['jquery'], '0.1.0', true);
            wp_enqueue_style('gm8-schema-admin', plugin_dir_url(__FILE__) . 'css/admin.css', [], '0.1.0');
        }
    }

    public function add_schema_metabox() {
        $screens = ['post', 'page', 'people']; // Add other CPTs as needed
        foreach ($screens as $screen) {
            add_meta_box(
                'gm8_schema_box',
                'Schema.org Data',
                [$this, 'render_schema_box'],
                $screen,
                'normal',
                'default'
            );
        }
    }

    public function render_schema_box($post) {
        wp_nonce_field('gm8_schema_save', 'gm8_schema_nonce');
        $schema_type = get_post_meta($post->ID, '_gm8_schema_type', true);
        $schema_data = get_post_meta($post->ID, '_gm8_schema_data', true);
        
        if (is_string($schema_data)) {
            $schema_data = json_decode($schema_data, true) ?: [];
        }
        ?>
        <div class="gm8-schema-container">
            <p>
                <label for="gm8_schema_type"><strong>Schema Type:</strong></label><br>
                <select name="gm8_schema_type" id="gm8_schema_type">
                    <option value="">-- Select Schema Type --</option>
                    <option value="Organization" <?php selected($schema_type, 'Organization'); ?>>Organization</option>
                    <option value="LocalBusiness" <?php selected($schema_type, 'LocalBusiness'); ?>>Local Business</option>
                    <option value="Person" <?php selected($schema_type, 'Person'); ?>>Person</option>
                    <option value="Article" <?php selected($schema_type, 'Article'); ?>>Article</option>
                    <option value="Service" <?php selected($schema_type, 'Service'); ?>>Service</option>
                </select>
            </p>

            <!-- Organization Schema -->
            <div class="schema-form" id="Organization-form" style="display: none;">
                <h4>Organization Information</h4>
                <table class="form-table">
                    <tr>
                        <th><label for="org_name">Organization Name</label></th>
                        <td><input type="text" id="org_name" name="schema_data[Organization][name]" value="<?php echo esc_attr($schema_data['Organization']['name'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="org_url">Website URL</label></th>
                        <td><input type="url" id="org_url" name="schema_data[Organization][url]" value="<?php echo esc_url($schema_data['Organization']['url'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="org_logo">Logo URL</label></th>
                        <td><input type="url" id="org_logo" name="schema_data[Organization][logo]" value="<?php echo esc_url($schema_data['Organization']['logo'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="org_description">Description</label></th>
                        <td><textarea id="org_description" name="schema_data[Organization][description]" rows="3" class="large-text"><?php echo esc_textarea($schema_data['Organization']['description'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="org_phone">Phone</label></th>
                        <td><input type="tel" id="org_phone" name="schema_data[Organization][telephone]" value="<?php echo esc_attr($schema_data['Organization']['telephone'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="org_email">Email</label></th>
                        <td><input type="email" id="org_email" name="schema_data[Organization][email]" value="<?php echo esc_attr($schema_data['Organization']['email'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                </table>
            </div>

            <!-- LocalBusiness Schema -->
            <div class="schema-form" id="LocalBusiness-form" style="display: none;">
                <h4>Local Business Information</h4>
                <table class="form-table">
                    <tr>
                        <th><label for="lb_name">Business Name</label></th>
                        <td><input type="text" id="lb_name" name="schema_data[LocalBusiness][name]" value="<?php echo esc_attr($schema_data['LocalBusiness']['name'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="lb_description">Description</label></th>
                        <td><textarea id="lb_description" name="schema_data[LocalBusiness][description]" rows="3" class="large-text"><?php echo esc_textarea($schema_data['LocalBusiness']['description'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="lb_url">Website URL</label></th>
                        <td><input type="url" id="lb_url" name="schema_data[LocalBusiness][url]" value="<?php echo esc_url($schema_data['LocalBusiness']['url'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="lb_phone">Phone</label></th>
                        <td><input type="tel" id="lb_phone" name="schema_data[LocalBusiness][telephone]" value="<?php echo esc_attr($schema_data['LocalBusiness']['telephone'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="lb_email">Email</label></th>
                        <td><input type="email" id="lb_email" name="schema_data[LocalBusiness][email]" value="<?php echo esc_attr($schema_data['LocalBusiness']['email'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="lb_address">Address</label></th>
                        <td>
                            <input type="text" id="lb_address" name="schema_data[LocalBusiness][address][streetAddress]" placeholder="Street Address" value="<?php echo esc_attr($schema_data['LocalBusiness']['address']['streetAddress'] ?? ''); ?>" class="regular-text" /><br>
                            <input type="text" name="schema_data[LocalBusiness][address][addressLocality]" placeholder="City" value="<?php echo esc_attr($schema_data['LocalBusiness']['address']['addressLocality'] ?? ''); ?>" class="regular-text" style="margin-top: 5px;" /><br>
                            <input type="text" name="schema_data[LocalBusiness][address][addressRegion]" placeholder="State/Region" value="<?php echo esc_attr($schema_data['LocalBusiness']['address']['addressRegion'] ?? ''); ?>" class="regular-text" style="margin-top: 5px;" /><br>
                            <input type="text" name="schema_data[LocalBusiness][address][postalCode]" placeholder="Postal Code" value="<?php echo esc_attr($schema_data['LocalBusiness']['address']['postalCode'] ?? ''); ?>" class="regular-text" style="margin-top: 5px;" /><br>
                            <input type="text" name="schema_data[LocalBusiness][address][addressCountry]" placeholder="Country" value="<?php echo esc_attr($schema_data['LocalBusiness']['address']['addressCountry'] ?? ''); ?>" class="regular-text" style="margin-top: 5px;" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="lb_hours">Opening Hours</label></th>
                        <td>
                            <textarea id="lb_hours" name="schema_data[LocalBusiness][openingHours]" rows="3" class="large-text" placeholder="Format: Mo-Fr 09:00-17:00, Sa 09:00-14:00"><?php echo esc_textarea($schema_data['LocalBusiness']['openingHours'] ?? ''); ?></textarea>
                            <p class="description">Use format: Mo-Fr 09:00-17:00, Sa 09:00-14:00</p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Person Schema -->
            <div class="schema-form" id="Person-form" style="display: none;">
                <h4>Person Information</h4>
                <table class="form-table">
                    <tr>
                        <th><label for="person_name">Full Name</label></th>
                        <td><input type="text" id="person_name" name="schema_data[Person][name]" value="<?php echo esc_attr($schema_data['Person']['name'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="person_job_title">Job Title</label></th>
                        <td><input type="text" id="person_job_title" name="schema_data[Person][jobTitle]" value="<?php echo esc_attr($schema_data['Person']['jobTitle'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="person_works_for">Works For</label></th>
                        <td>
                            <select name="schema_data[Person][worksFor][@type]" style="width: 120px; margin-right: 10px;">
                                <option value="Organization" <?php selected($schema_data['Person']['worksFor']['@type'] ?? '', 'Organization'); ?>>Organization</option>
                                <option value="LocalBusiness" <?php selected($schema_data['Person']['worksFor']['@type'] ?? '', 'LocalBusiness'); ?>>Local Business</option>
                            </select>
                            <input type="text" id="person_works_for" name="schema_data[Person][worksFor][name]" placeholder="Company/Organization Name" value="<?php echo esc_attr($schema_data['Person']['worksFor']['name'] ?? ''); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="person_description">Description</label></th>
                        <td><textarea id="person_description" name="schema_data[Person][description]" rows="3" class="large-text"><?php echo esc_textarea($schema_data['Person']['description'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="person_email">Email</label></th>
                        <td><input type="email" id="person_email" name="schema_data[Person][email]" value="<?php echo esc_attr($schema_data['Person']['email'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="person_phone">Phone</label></th>
                        <td><input type="tel" id="person_phone" name="schema_data[Person][telephone]" value="<?php echo esc_attr($schema_data['Person']['telephone'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="person_image">Image URL</label></th>
                        <td><input type="url" id="person_image" name="schema_data[Person][image]" value="<?php echo esc_url($schema_data['Person']['image'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                </table>
            </div>

            <!-- Article Schema -->
            <div class="schema-form" id="Article-form" style="display: none;">
                <h4>Article Information</h4>
                <table class="form-table">
                    <tr>
                        <th><label for="article_headline">Headline</label></th>
                        <td><input type="text" id="article_headline" name="schema_data[Article][headline]" value="<?php echo esc_attr($schema_data['Article']['headline'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="article_description">Description</label></th>
                        <td><textarea id="article_description" name="schema_data[Article][description]" rows="3" class="large-text"><?php echo esc_textarea($schema_data['Article']['description'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="article_author">Author</label></th>
                        <td>
                            <select name="schema_data[Article][author][@type]" style="width: 120px; margin-right: 10px;">
                                <option value="Person" <?php selected($schema_data['Article']['author']['@type'] ?? '', 'Person'); ?>>Person</option>
                                <option value="Organization" <?php selected($schema_data['Article']['author']['@type'] ?? '', 'Organization'); ?>>Organization</option>
                            </select>
                            <input type="text" id="article_author" name="schema_data[Article][author][name]" placeholder="Author Name" value="<?php echo esc_attr($schema_data['Article']['author']['name'] ?? ''); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="article_publisher">Publisher</label></th>
                        <td>
                            <select name="schema_data[Article][publisher][@type]" style="width: 120px; margin-right: 10px;">
                                <option value="Organization" <?php selected($schema_data['Article']['publisher']['@type'] ?? '', 'Organization'); ?>>Organization</option>
                                <option value="LocalBusiness" <?php selected($schema_data['Article']['publisher']['@type'] ?? '', 'LocalBusiness'); ?>>Local Business</option>
                            </select>
                            <input type="text" id="article_publisher" name="schema_data[Article][publisher][name]" placeholder="Publisher Name" value="<?php echo esc_attr($schema_data['Article']['publisher']['name'] ?? ''); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="article_publisher_logo">Publisher Logo</label></th>
                        <td><input type="url" id="article_publisher_logo" name="schema_data[Article][publisher][logo][url]" value="<?php echo esc_url($schema_data['Article']['publisher']['logo']['url'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="article_date_published">Date Published</label></th>
                        <td><input type="date" id="article_date_published" name="schema_data[Article][datePublished]" value="<?php echo esc_attr($schema_data['Article']['datePublished'] ?? ''); ?>" /></td>
                    </tr>
                    <tr>
                        <th><label for="article_date_modified">Date Modified</label></th>
                        <td><input type="date" id="article_date_modified" name="schema_data[Article][dateModified]" value="<?php echo esc_attr($schema_data['Article']['dateModified'] ?? ''); ?>" /></td>
                    </tr>
                    <tr>
                        <th><label for="article_image">Featured Image</label></th>
                        <td><input type="url" id="article_image" name="schema_data[Article][image]" value="<?php echo esc_url($schema_data['Article']['image'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                </table>
            </div>

            <!-- Service Schema -->
            <div class="schema-form" id="Service-form" style="display: none;">
                <h4>Service Information</h4>
                <table class="form-table">
                    <tr>
                        <th><label for="service_name">Service Name</label></th>
                        <td><input type="text" id="service_name" name="schema_data[Service][name]" value="<?php echo esc_attr($schema_data['Service']['name'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="service_description">Description</label></th>
                        <td><textarea id="service_description" name="schema_data[Service][description]" rows="3" class="large-text"><?php echo esc_textarea($schema_data['Service']['description'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="service_provider">Service Provider</label></th>
                        <td>
                            <select name="schema_data[Service][provider][@type]" style="width: 120px; margin-right: 10px;">
                                <option value="Person" <?php selected($schema_data['Service']['provider']['@type'] ?? '', 'Person'); ?>>Person</option>
                                <option value="Organization" <?php selected($schema_data['Service']['provider']['@type'] ?? '', 'Organization'); ?>>Organization</option>
                                <option value="LocalBusiness" <?php selected($schema_data['Service']['provider']['@type'] ?? '', 'LocalBusiness'); ?>>Local Business</option>
                            </select>
                            <input type="text" id="service_provider" name="schema_data[Service][provider][name]" placeholder="Provider Name" value="<?php echo esc_attr($schema_data['Service']['provider']['name'] ?? ''); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="service_area">Service Areas</label></th>
                        <td>
                            <div id="service-areas-container">
                                                                 <?php 
                                 $areas = $schema_data['Service']['areaServed'] ?? [];
                                 if (is_array($areas) && !empty($areas)) {
                                     foreach ($areas as $index => $area) {
                                         if (is_array($area) && isset($area['name'])) {
                                             $area_name = $area['name'];
                                             $area_type = $area['@type'] ?? '';
                                             
                                             // For countries, show the display name but keep ISO code as value
                                             $display_name = $area_name;
                                             if ($area_type === 'Country' && !empty($area_name)) {
                                                 $country_name = GM8_Countries::get_name($area_name);
                                                 if ($country_name) {
                                                     $display_name = $country_name;
                                                 }
                                             }
                                             ?>
                                             <div class="service-area-item" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 3px; background: #f9f9f9;">
                                                 <select name="schema_data[Service][areaServed][<?php echo $index; ?>][@type]" class="area-type-select" style="width: 120px; margin-right: 10px;">
                                                     <option value="Country" <?php selected($area_type, 'Country'); ?>>Country</option>
                                                     <option value="State" <?php selected($area_type, 'State'); ?>>State/Province</option>
                                                     <option value="City" <?php selected($area_type, 'City'); ?>>City</option>
                                                     <option value="AdministrativeArea" <?php selected($area_type, 'AdministrativeArea'); ?>>Administrative Area</option>
                                                 </select>
                                                 <?php if ($area_type === 'Country'): ?>
                                                     <select name="schema_data[Service][areaServed][<?php echo $index; ?>][name]" class="regular-text" style="width: 250px;">
                                                         <?php echo GM8_Countries::get_select_options($area_name); ?>
                                                     </select>
                                                 <?php else: ?>
                                                     <input type="text" name="schema_data[Service][areaServed][<?php echo $index; ?>][name]" placeholder="Location Name (e.g., California, London)" value="<?php echo esc_attr($area_name); ?>" class="regular-text area-name-input" style="width: 250px;" />
                                                 <?php endif; ?>
                                                 <button type="button" class="button remove-area" style="margin-left: 10px;">Remove</button>
                                             </div>
                                             <?php
                                         }
                                     }
                                 }
                                 ?>
                            </div>
                                                         <button type="button" class="button add-area" style="margin-top: 10px;">+ Add Service Area</button>
                             <p class="description">Add the geographic areas where you provide this service. You can add multiple locations.</p>
                             <p class="description" style="margin-top: 5px; color: #666;">
                                 <strong>Tips:</strong><br>
                                 • <strong>Country:</strong> Use for broad service areas (e.g., USA, UK, Canada)<br>
                                 • <strong>State/Province:</strong> Use for regional areas (e.g., California, Texas, Ontario)<br>
                                 • <strong>City:</strong> Use for specific cities (e.g., Cleveland, London, Toronto)<br>
                                 • <strong>Administrative Area:</strong> Use for other regions (e.g., Greater London, Bay Area)
                             </p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="service_url">Service URL</label></th>
                        <td><input type="url" id="service_url" name="schema_data[Service][url]" value="<?php echo esc_url($schema_data['Service']['url'] ?? get_permalink($post->ID)); ?>" class="regular-text" /></td>
                    </tr>
                </table>
            </div>

            <div id="schema-preview" style="display: none;">
                <h4>Schema Preview</h4>
                <div id="schema-json-preview" style="background: #f9f9f9; padding: 10px; border: 1px solid #ddd; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;"></div>
            </div>
        </div>
        <?php
    }

    public function save_schema_data($post_id) {
        if (!isset($_POST['gm8_schema_nonce']) || !wp_verify_nonce($_POST['gm8_schema_nonce'], 'gm8_schema_save')) return;
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        if (isset($_POST['gm8_schema_type'])) {
            update_post_meta($post_id, '_gm8_schema_type', sanitize_text_field($_POST['gm8_schema_type']));
        }
        
        if (isset($_POST['schema_data'])) {
            // Debug: Log the raw POST data
            error_log('GM8 Schema - Raw POST data: ' . print_r($_POST['schema_data'], true));
            
            $schema_data = $this->sanitize_schema_data($_POST['schema_data']);
            
            // Debug: Log the sanitized data
            error_log('GM8 Schema - Sanitized data: ' . print_r($schema_data, true));
            
            update_post_meta($post_id, '_gm8_schema_data', $schema_data);
        }
    }

    private function sanitize_schema_data($data) {
        if (!is_array($data)) return [];
        
        $sanitized = [];
        foreach ($data as $schema_type => $fields) {
            if (!is_array($fields)) continue;
            
            $sanitized[$schema_type] = [];
            foreach ($fields as $field => $value) {
                if ($field === 'address' && is_array($value)) {
                    $sanitized[$schema_type][$field] = [];
                    foreach ($value as $addr_field => $addr_value) {
                        $sanitized[$schema_type][$field][$addr_field] = sanitize_text_field($addr_value);
                    }
                } elseif ($field === 'author' || $field === 'publisher' || $field === 'provider' || $field === 'worksFor') {
                    if (is_array($value)) {
                        $sanitized[$schema_type][$field] = [];
                        foreach ($value as $sub_field => $sub_value) {
                            if ($sub_field === '@type') {
                                $sanitized[$schema_type][$field][$sub_field] = sanitize_text_field($sub_value);
                            } elseif ($sub_field === 'logo' && is_array($sub_value)) {
                                $sanitized[$schema_type][$field][$sub_field] = [];
                                foreach ($sub_value as $logo_field => $logo_value) {
                                    $sanitized[$schema_type][$field][$sub_field][$logo_field] = sanitize_url($logo_value);
                                }
                            } else {
                                $sanitized[$schema_type][$field][$sub_field] = sanitize_text_field($sub_value);
                            }
                        }
                    }
                } elseif ($field === 'areaServed') {
                    error_log('GM8 Schema - Processing areaServed: ' . print_r($value, true));
                    if (is_array($value)) {
                        $sanitized[$schema_type][$field] = [];
                        foreach ($value as $area_index => $area_data) {
                            if (is_array($area_data) && isset($area_data['@type']) && isset($area_data['name'])) {
                                $sanitized[$schema_type][$field][] = [
                                    '@type' => sanitize_text_field($area_data['@type']),
                                    'name' => sanitize_text_field($area_data['name'])
                                ];
                            }
                        }
                        error_log('GM8 Schema - Final areaServed: ' . print_r($sanitized[$schema_type][$field], true));
                    }
                } elseif ($field === 'openingHours') {
                    $sanitized[$schema_type][$field] = sanitize_textarea_field($value);
                } elseif (in_array($field, ['url', 'logo', 'image'])) {
                    $sanitized[$schema_type][$field] = sanitize_url($value);
                } elseif (in_array($field, ['email', 'telephone'])) {
                    $sanitized[$schema_type][$field] = sanitize_text_field($value);
                } elseif (in_array($field, ['datePublished', 'dateModified'])) {
                    $sanitized[$schema_type][$field] = sanitize_text_field($value);
                } else {
                    $sanitized[$schema_type][$field] = sanitize_textarea_field($value);
                }
            }
        }
        
        return $sanitized;
    }

    public function inject_schema() {
        if (!is_singular()) return;
        global $post;
        $schema_type = get_post_meta($post->ID, '_gm8_schema_type', true);
        $schema_data = get_post_meta($post->ID, '_gm8_schema_data', true);
        
        if (!$schema_type || !$schema_data) return;

        $json = [
            '@context' => 'https://schema.org',
            '@type' => $schema_type
        ];

        // Merge in user-provided data
        if (is_array($schema_data) && isset($schema_data[$schema_type])) {
            $json = array_merge($json, $schema_data[$schema_type]);
        }

        // Add some automatic fields
        if ($schema_type === 'Article') {
            if (!isset($json['datePublished']) && $post->post_date) {
                $json['datePublished'] = get_the_date('c', $post->ID);
            }
            if (!isset($json['dateModified']) && $post->post_modified) {
                $json['dateModified'] = get_the_modified_date('c', $post->ID);
            }
            if (!isset($json['headline'])) {
                $json['headline'] = get_the_title($post->ID);
            }
        }

        echo "<script type='application/ld+json'>" . wp_json_encode($json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "</script>\n";
    }
}

new GM8_Schema_Manager();
