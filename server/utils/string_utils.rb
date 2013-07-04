class StringUtils
	def is_integer?(str)
		true if Integer(str) rescue false
	end
end