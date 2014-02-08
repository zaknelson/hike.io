class Sanitizer
		INPUT_TO_REPLACE_MAPPING = {
		"<div>"		=> "\n",
		"</div>"	=> "\n",
		"<br>"		=> "\n",
		"<br/>"		=> "\n",
		"</br>"		=> "\n",
		"<p>"		=> "\n",
		"</p>"		=> "\n",
		"<strong>"	=> "<b>",
		"</strong>"	=> "</b>",
		"<em>"		=> "<i>",
		"</em>"		=> "</i>",
		"&nbsp;"	=> " ",

		'href="http://hike.io'	=> 'href="',
		'href="hike.io'			=> 'href="'
	}

	SINGULAR_TO_PLURAL = {
		"mile"			=> "miles",
		"foot"			=> "feet",
		"meter"			=> "meters",
		"kilometer"		=> "kilometers"
	}

	PLURAL_TO_SINGULAR = {
		"miles"			=> "mile",
		"feet"			=> "foot",
		"meters"		=> "meter",
		"kilometers"	=> "kilometer"
	}

	IMPERIAL_TO_METRIC = {
		"foot" => 
			{ "units" => "meter", "ratio" => 0.30480 },
		"feet" => 
			{ "units" => "meters", "ratio" => 0.30480 },
		"ft" => 
			{ "units" => "m", "ratio" => 0.30480 },
		"mile" => 
			{ "units" => "kilometer", "ratio" => 1.609344 },
		"miles" => 
			{ "units" => "kilometers", "ratio" => 1.609344 },
		"mi" => 
			{ "units" => "km", "ratio" => 1.609344 },
	}

	def self.clean_html(html)
		return html if not html
		# The html that comes in from contenteditable is pretty unweidly, try to clean it up
		html.gsub! /(<div>|<\/div>|<div\/>|<br>|<br\/>|<\/br>|<p>|<\/p>|<p\/>|<strong>|<\/strong>|<em>|<\/em>|&nbsp;|href="http:\/\/hike\.io|href="hike\.io)/i do |match|
			INPUT_TO_REPLACE_MAPPING[match.to_s]
		end
		cleaned_html = ""
		html_elements = html.split("\n")
		html_elements.each do |element|
			element.strip!
			next if element.length == 0
			if element.start_with?("<h3>") || element.end_with?("</h3>")
				cleaned_html += element
			else
				cleaned_html += "<p>" + element + "</p>"
			end
		end

		cleaned_html = Sanitize.clean(cleaned_html, 
			:add_attributes => {
				"a" => {"rel" => "nofollow"}
			},
			:elements => ["h3", "b", "i", "p", "a"],
			:attributes => { "a" => ["href"] },
			:transformers => lambda do |env|
				# Remove rel=nofollow on relative links
				node = env[:node]
				node_name = env[:node_name]
				return unless node_name == "a"
				return unless node["href"].start_with?("/")
				Sanitize.clean_node!(node, {
					:elements => ["a"],
					:attributes => { "a" => ["href"] }
				})
				{ :node_whitelist => [node] }
			end)
		cleaned_html.gsub! /((\.|,|\d)*\d+(\.|,|\d)*[ \-](miles|mile|mi|feet|foot|ft|kilometers|kilometer|km|meters|meter|m)\W)/ do |match|
			trailing_bit = match.slice!(-1)
			separator = match.include?("-") ? "-" : " "
			arr = match.split(separator)
			value = arr[0].gsub(",", "").to_f

			# If we are using a space as a separator, we need plural units since the sentence was something like: "The hike is 4 miles."
			# If we are using a dash as a separator, we need singular units since the sentence was something like: "The 4-mile hike is ..."
			if (separator == "-")
				units = PLURAL_TO_SINGULAR[arr[1]] || arr[1]
			else
				units = SINGULAR_TO_PLURAL[arr[1]] || arr[1]
			end

			# Always store the units in metric
			if (IMPERIAL_TO_METRIC[units])
				value = (value * IMPERIAL_TO_METRIC[units]["ratio"]).round(5)
				units = IMPERIAL_TO_METRIC[units]["units"]
			end
			"<span data-conversion=\"true\" data-value=\"#{value}\" data-units=\"#{units}\"><span data-value=\"true\">#{value}</span>#{separator}<span data-units=\"true\">#{units}</span></span>#{trailing_bit}"
		end
		cleaned_html
	end

	def self.clean_anchor(html)
		return html if not html
		Sanitize.clean(html, 
			:add_attributes => {
				"a" => {"rel" => "nofollow"}
			},
			:elements => ["a"],
			:attributes => { "a" => ["href"] })
	end

	def self.clean_string(str)
		Sanitize.clean(str).gsub("&amp;","&")
	end
end