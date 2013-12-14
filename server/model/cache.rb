class Cache
	

	def initialize
		@cache = {}
	end

	def get key
		@cache[key]
	end

	def set key, value
		@cache[key] = value
	end

	def remove key, and_those_with_prefix=false
		@cache.delete(key)
		if and_those_with_prefix
			@cache.keys.each do |k|
				if k.start_with?(key) && k[key.length] == "?"
					@cache.delete(k)
				end
			end
		end
	end
end