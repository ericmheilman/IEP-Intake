#!/usr/bin/env python3

# Script to update the DSP Info route to handle the new form structure

import re

# Read the current app.py file
with open('app.py', 'r') as f:
    content = f.read()

# Find the settings_dsp_info function and update it
def update_dsp_route():
    # Pattern to find the return statement in settings_dsp_info
    pattern = r'(def settings_dsp_info\(\):.*?return render_template\(\'settings/dsp_info\.html\', dsp_settings=dsp_settings\))'
    
    # Replacement with updated return statement
    replacement = r'''def settings_dsp_info():
    """Handle DSP settings form submission and display."""
    
    # Get existing DSP settings for the current user
    dsp_settings = DSPSettings.query.filter_by(user_id=current_user.id).first()
    
    if request.method == 'POST':
        try:
            # Handle file upload for logo
            logo_file = request.files.get('logo_file')
            logo_filename = None
            
            if logo_file and logo_file.filename:
                # Secure the filename and save to uploads directory
                from werkzeug.utils import secure_filename
                import os
                
                upload_folder = os.path.join(app.static_folder, 'uploads', 'logos')
                os.makedirs(upload_folder, exist_ok=True)
                
                logo_filename = secure_filename(logo_file.filename)
                logo_path = os.path.join(upload_folder, logo_filename)
                logo_file.save(logo_path)
            
            if dsp_settings:
                # Update existing settings with new form field mapping
                dsp_settings.country = request.form.get('country', '')
                dsp_settings.proprietor_name = request.form.get('proprietor_name', '')
                dsp_settings.business_name = request.form.get('business_name', '')
                dsp_settings.time_zone = request.form.get('timezone', '')
                
                # Parse operations start month
                start_month_str = request.form.get('start_month', '')
                if start_month_str:
                    try:
                        from datetime import datetime
                        dsp_settings.operations_start_month = datetime.strptime(start_month_str + '-01', '%Y-%m-%d').date()
                    except ValueError:
                        dsp_settings.operations_start_month = None
                
                # Business address (billing address)
                dsp_settings.street_address = request.form.get('billing_address1', '')
                dsp_settings.address_line_2 = request.form.get('billing_address2', '')
                dsp_settings.city = request.form.get('billing_city', '')
                dsp_settings.state_region = request.form.get('billing_state', '')
                dsp_settings.zip_code = request.form.get('billing_zip', '')
                dsp_settings.phone_number = request.form.get('billing_phone', '')
                
                # Same as shipping address checkbox
                dsp_settings.same_as_shipping = 'same_as_shipping' in request.form
                
                # Shipping address (only if different from billing)
                if not dsp_settings.same_as_shipping:
                    dsp_settings.shipping_street_address = request.form.get('shipping_address1', '')
                    dsp_settings.shipping_address_line_2 = request.form.get('shipping_address2', '')
                    dsp_settings.shipping_city = request.form.get('shipping_city', '')
                    dsp_settings.shipping_state_region = request.form.get('shipping_state', '')
                    dsp_settings.shipping_zip_code = request.form.get('shipping_zip', '')
                    dsp_settings.shipping_phone_number = request.form.get('shipping_phone', '')
                else:
                    # Clear shipping address if same as billing
                    dsp_settings.shipping_street_address = ''
                    dsp_settings.shipping_address_line_2 = ''
                    dsp_settings.shipping_city = ''
                    dsp_settings.shipping_state_region = ''
                    dsp_settings.shipping_zip_code = ''
                    dsp_settings.shipping_phone_number = ''
            else:
                # Create new settings with new form field mapping
                from datetime import datetime
                start_month_str = request.form.get('start_month', '')
                operations_start_month = None
                if start_month_str:
                    try:
                        operations_start_month = datetime.strptime(start_month_str + '-01', '%Y-%m-%d').date()
                    except ValueError:
                        operations_start_month = None
                
                same_as_shipping = 'same_as_shipping' in request.form
                
                dsp_settings = DSPSettings(
                    user_id=current_user.id,
                    country=request.form.get('country', ''),
                    proprietor_name=request.form.get('proprietor_name', ''),
                    business_name=request.form.get('business_name', ''),
                    time_zone=request.form.get('timezone', ''),
                    operations_start_month=operations_start_month,
                    street_address=request.form.get('billing_address1', ''),
                    address_line_2=request.form.get('billing_address2', ''),
                    city=request.form.get('billing_city', ''),
                    state_region=request.form.get('billing_state', ''),
                    zip_code=request.form.get('billing_zip', ''),
                    phone_number=request.form.get('billing_phone', ''),
                    same_as_shipping=same_as_shipping,
                    shipping_street_address=request.form.get('shipping_address1', '') if not same_as_shipping else '',
                    shipping_address_line_2=request.form.get('shipping_address2', '') if not same_as_shipping else '',
                    shipping_city=request.form.get('shipping_city', '') if not same_as_shipping else '',
                    shipping_state_region=request.form.get('shipping_state', '') if not same_as_shipping else '',
                    shipping_zip_code=request.form.get('shipping_zip', '') if not same_as_shipping else '',
                    shipping_phone_number=request.form.get('shipping_phone', '') if not same_as_shipping else '',
                )
                db.session.add(dsp_settings)
            
            db.session.commit()
            flash('DSP Settings saved successfully!', 'success')
            return redirect(url_for('settings_dsp_info'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Error saving DSP settings: {str(e)}', 'error')
            print(f"Error saving DSP settings: {str(e)}")  # Debug print
    
    # Convert DSP settings to form data for template
    form_data = None
    if dsp_settings:
        form_data = {
            'country': dsp_settings.country,
            'proprietor_name': dsp_settings.proprietor_name,
            'business_name': dsp_settings.business_name,
            'timezone': dsp_settings.time_zone,
            'start_month': dsp_settings.operations_start_month.strftime('%Y-%m') if dsp_settings.operations_start_month else '',
            'billing_address1': dsp_settings.street_address,
            'billing_address2': dsp_settings.address_line_2,
            'billing_city': dsp_settings.city,
            'billing_state': dsp_settings.state_region,
            'billing_zip': dsp_settings.zip_code,
            'billing_phone': dsp_settings.phone_number,
            'same_as_shipping': dsp_settings.same_as_shipping,
            'shipping_address1': dsp_settings.shipping_street_address,
            'shipping_address2': dsp_settings.shipping_address_line_2,
            'shipping_city': dsp_settings.shipping_city,
            'shipping_state': dsp_settings.shipping_state_region,
            'shipping_zip': dsp_settings.shipping_zip_code,
            'shipping_phone': dsp_settings.shipping_phone_number,
        }
    
    return render_template('settings/dsp_info.html', form_data=form_data)'''

    # Use regex to replace the function
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write the updated content back to the file
    with open('app.py', 'w') as f:
        f.write(new_content)
    
    print("DSP Info route updated successfully!")

if __name__ == '__main__':
    update_dsp_route()

